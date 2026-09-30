"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { TeamModel } from "@/models/Team";
import { getSettings } from "@/lib/data/settings";
import { TEAM_MIN_MEMBERS, TEAM_MAX_MEMBERS, TEAM_MIN_SENIORS, TEAM_MAX_SENIORS } from "@/lib/data/teams";
import { ALLOWED_EMAIL_DOMAIN } from "@/auth";
import { isDeadlinePassed } from "@/lib/deadline";
import { fieldError, type ActionState } from "@/lib/actions/state";
import { LIMITS, formString, parseList, withinLength } from "@/lib/validation";

// Best-effort, per-instance throttle for teammate lookups (the endpoint reveals whether an email is registered).
const LOOKUP_WINDOW_MS = 60_000;
const LOOKUP_MAX_PER_WINDOW = 30;
const lookupHits = new Map<string, number[]>();

function isLookupThrottled(userId: string): boolean {
  const now = Date.now();
  const recent = (lookupHits.get(userId) ?? []).filter((t) => now - t < LOOKUP_WINDOW_MS);
  recent.push(now);
  lookupHits.set(userId, recent);
  return recent.length > LOOKUP_MAX_PER_WINDOW;
}

export type { ActionState } from "@/lib/actions/state";

export type TeammateLookup =
  | { found: false }
  | { found: true; name: string; role: string; photoUrl?: string; onAnotherTeam: boolean };

export async function lookupTeammate(email: string): Promise<TeammateLookup> {
  const me = await requireUser();
  if (isLookupThrottled(String(me._id))) return { found: false };

  const normalized = String(email ?? "").trim().toLowerCase();
  if (normalized.length > 254 || !normalized.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) return { found: false };

  await connectToDatabase();
  const user = await UserModel.findOne({ email: normalized })
    .select("name role photoUrl teamId")
    .lean();

  if (!user) return { found: false };

  return {
    found: true,
    name: user.name,
    role: user.role,
    photoUrl: user.photoUrl,
    onAnotherTeam: Boolean(user.teamId),
  };
}

export async function createTeam(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  await connectToDatabase();

  if (user.teamId) {
    return { error: "You're already on a team." };
  }

  const settings = await getSettings();
  if (!settings.formationPhaseOpen || isDeadlinePassed(settings.teamFormationDeadline)) {
    return { error: "Team formation is closed. Contact an admin to be assigned to a team." };
  }

  const name = formString(formData, "name");
  const teammateEmails = parseList(formString(formData, "emails").toLowerCase(), /[\n,]/).filter(
    (e) => e !== user.email
  );

  if (!name) return fieldError("name", "Team name is required.");
  if (!withinLength(name, LIMITS.name)) return fieldError("name", `Team name must be ${LIMITS.name} characters or fewer.`);
  if (teammateEmails.length + 1 > TEAM_MAX_MEMBERS) {
    return fieldError("emails", `Teams can have at most ${TEAM_MAX_MEMBERS} members.`);
  }

  const invalidDomain = teammateEmails.find((e) => !e.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`));
  if (invalidDomain) return fieldError("emails", `"${invalidDomain}" is not a VIT student email.`);

  const totalSize = 1 + teammateEmails.length;
  if (totalSize < TEAM_MIN_MEMBERS || totalSize > TEAM_MAX_MEMBERS) {
    return fieldError("emails", `Teams must have ${TEAM_MIN_MEMBERS}-${TEAM_MAX_MEMBERS} members (you entered ${totalSize}).`);
  }

  const existingTeammates = await UserModel.find({ email: { $in: teammateEmails } });
  const alreadyTeamed = existingTeammates.filter((u) => u.teamId);
  if (alreadyTeamed.length > 0) {
    return fieldError("emails", `Already on a team: ${alreadyTeamed.map((u) => u.email).join(", ")}`);
  }

  const existingByEmail = new Map(existingTeammates.map((u) => [u.email, u]));
  const seniorCount =
    (user.role === "senior" ? 1 : 0) +
    teammateEmails.filter((e) => {
      const existing = existingByEmail.get(e);
      return existing?.role === "senior";
    }).length;

  if (seniorCount < TEAM_MIN_SENIORS || seniorCount > TEAM_MAX_SENIORS) {
    return fieldError("emails", `Teams need ${TEAM_MIN_SENIORS}-${TEAM_MAX_SENIORS} seniors (this roster has ${seniorCount}).`);
  }

  // Create placeholder accounts for teammates who haven't logged in yet.
  const memberDocs = await Promise.all(
    teammateEmails.map(async (email) => {
      const existing = existingByEmail.get(email);
      if (existing) return existing;
      return UserModel.create({
        name: email.split("@")[0],
        email,
        role: "fresher",
        teamId: null,
        points: 0,
      });
    })
  );

  const allMemberIds = [user._id, ...memberDocs.map((m) => m._id)];

  const team = await TeamModel.create({
    name,
    leaderId: user._id,
    memberIds: allMemberIds,
    points: 0,
  });

  // Only claim members who are still unassigned; if anyone was grabbed by another team in the
  // meantime, roll this team back instead of leaving members double-booked.
  const claimed = await UserModel.updateMany(
    { _id: { $in: allMemberIds }, teamId: null },
    { $set: { teamId: team._id } }
  );
  if (claimed.modifiedCount !== allMemberIds.length) {
    await UserModel.updateMany({ teamId: team._id }, { $set: { teamId: null } });
    await TeamModel.findByIdAndDelete(team._id);
    return { error: "A teammate joined another team while you were submitting. Please try again." };
  }

  revalidatePath("/dashboard/team");
  return { success: true };
}
