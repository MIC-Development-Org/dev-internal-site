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

export type ActionState = { error?: string; success?: boolean };

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

  const name = String(formData.get("name") ?? "").trim();
  const emailsRaw = String(formData.get("emails") ?? "");
  const teammateEmails = Array.from(
    new Set(
      emailsRaw
        .split(/[\n,]/)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    )
  ).filter((e) => e !== user.email);

  if (!name) return { error: "Team name is required." };

  const invalidDomain = teammateEmails.find((e) => !e.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`));
  if (invalidDomain) return { error: `"${invalidDomain}" is not a VIT student email.` };

  const totalSize = 1 + teammateEmails.length;
  if (totalSize < TEAM_MIN_MEMBERS || totalSize > TEAM_MAX_MEMBERS) {
    return { error: `Teams must have ${TEAM_MIN_MEMBERS}-${TEAM_MAX_MEMBERS} members (you entered ${totalSize}).` };
  }

  const existingTeammates = await UserModel.find({ email: { $in: teammateEmails } });
  const alreadyTeamed = existingTeammates.filter((u) => u.teamId);
  if (alreadyTeamed.length > 0) {
    return { error: `Already on a team: ${alreadyTeamed.map((u) => u.email).join(", ")}` };
  }

  const existingByEmail = new Map(existingTeammates.map((u) => [u.email, u]));
  const seniorCount =
    (user.role === "senior" || user.role === "admin" ? 1 : 0) +
    teammateEmails.filter((e) => {
      const existing = existingByEmail.get(e);
      return existing?.role === "senior" || existing?.role === "admin";
    }).length;

  if (seniorCount < TEAM_MIN_SENIORS || seniorCount > TEAM_MAX_SENIORS) {
    return {
      error: `Teams need ${TEAM_MIN_SENIORS}-${TEAM_MAX_SENIORS} seniors (this roster has ${seniorCount}).`,
    };
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

  await UserModel.updateMany({ _id: { $in: allMemberIds } }, { $set: { teamId: team._id } });

  revalidatePath("/dashboard/team");
  return { success: true };
}
