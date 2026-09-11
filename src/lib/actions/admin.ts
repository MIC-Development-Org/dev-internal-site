"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel, USER_ROLES, type UserRole } from "@/models/User";
import { TeamModel } from "@/models/Team";
import { ProjectModel, PROJECT_STATUSES, type ProjectStatus } from "@/models/Project";
import { PointsLogModel, type PointsTargetType } from "@/models/PointsLog";
import { SettingsModel, SETTINGS_SINGLETON_ID } from "@/models/Settings";
import { deleteTeamCascade } from "@/lib/data/teams";
import type { ActionState } from "@/lib/actions/team";

export async function setUserRole(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  await connectToDatabase();

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!USER_ROLES.includes(role as UserRole)) return { error: "Invalid role." };

  await UserModel.findByIdAndUpdate(userId, { role });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function manualCreateTeam(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  await connectToDatabase();

  const name = String(formData.get("name") ?? "").trim();
  const leaderId = String(formData.get("leaderId") ?? "");
  const memberIdsRaw = String(formData.get("memberIds") ?? "");
  const memberIds = Array.from(new Set(memberIdsRaw.split(",").map((s) => s.trim()).filter(Boolean)));

  if (!name || !leaderId) return { error: "Team name and leader are required." };
  if (!memberIds.includes(leaderId)) memberIds.push(leaderId);

  const alreadyTeamed = await UserModel.find({ _id: { $in: memberIds }, teamId: { $ne: null } }).select("email");
  if (alreadyTeamed.length > 0) {
    return { error: `Already on a team: ${alreadyTeamed.map((u) => u.email).join(", ")}` };
  }

  const team = await TeamModel.create({ name, leaderId, memberIds, points: 0 });
  await UserModel.updateMany({ _id: { $in: memberIds } }, { $set: { teamId: team._id } });

  revalidatePath("/admin/teams");
  return { success: true };
}

export async function editTeamRoster(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  await connectToDatabase();

  const teamId = String(formData.get("teamId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const leaderId = String(formData.get("leaderId") ?? "");
  const memberIdsRaw = String(formData.get("memberIds") ?? "");
  const memberIds = Array.from(new Set(memberIdsRaw.split(",").map((s) => s.trim()).filter(Boolean)));

  const team = await TeamModel.findById(teamId);
  if (!team) return { error: "Team not found." };
  if (!memberIds.includes(leaderId)) memberIds.push(leaderId);

  const previousMemberIds = team.memberIds.map(String);
  const removed = previousMemberIds.filter((id) => !memberIds.includes(id));
  const added = memberIds.filter((id) => !previousMemberIds.includes(id));

  const claimedElsewhere = await UserModel.find({
    _id: { $in: added },
    teamId: { $nin: [null, teamId] },
  }).select("email");
  if (claimedElsewhere.length > 0) {
    return { error: `Already on another team: ${claimedElsewhere.map((u) => u.email).join(", ")}` };
  }

  team.name = name || team.name;
  team.leaderId = leaderId as unknown as typeof team.leaderId;
  team.memberIds = memberIds as unknown as typeof team.memberIds;
  await team.save();

  if (removed.length) await UserModel.updateMany({ _id: { $in: removed } }, { $set: { teamId: null } });
  if (added.length) await UserModel.updateMany({ _id: { $in: added } }, { $set: { teamId: team._id } });

  revalidatePath("/admin/teams");
  revalidatePath(`/admin/teams/${teamId}`);
  return { success: true };
}

export async function dissolveTeam(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const teamId = String(formData.get("teamId") ?? "");
  await deleteTeamCascade(teamId);
  revalidatePath("/admin/teams");
  return { success: true };
}

export async function updateProjectStatus(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const projectId = String(formData.get("projectId") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!PROJECT_STATUSES.includes(status as ProjectStatus)) return { error: "Invalid status." };

  const project = await ProjectModel.findById(projectId);
  if (!project) return { error: "Project not found." };

  project.status = status as ProjectStatus;
  if (note) {
    project.feedback.push({ note, byAdminId: admin._id, at: new Date() });
  }
  await project.save();

  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/dashboard/project");
  revalidatePath("/dashboard/showcase");
  return { success: true };
}

export async function awardPoints(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const targetType = String(formData.get("targetType") ?? "") as PointsTargetType;
  const targetId = String(formData.get("targetId") ?? "");
  const amount = Number(formData.get("amount"));
  const reason = String(formData.get("reason") ?? "").trim();

  if (!["user", "team"].includes(targetType)) return { error: "Invalid target type." };
  if (!targetId || Number.isNaN(amount) || amount === 0) return { error: "Pick a target and non-zero amount." };
  if (!reason) return { error: "An internal reason tag is required." };

  if (targetType === "user") {
    const target = await UserModel.findById(targetId);
    if (!target) return { error: "Target not found." };
    target.points = (target.points ?? 0) + amount;
    await target.save();
  } else {
    const target = await TeamModel.findById(targetId);
    if (!target) return { error: "Target not found." };
    target.points = (target.points ?? 0) + amount;
    await target.save();
  }

  await PointsLogModel.create({ targetId, targetType, amount, reason, awardedBy: admin._id });

  revalidatePath("/admin/leaderboard");
  revalidatePath("/dashboard/leaderboard");
  return { success: true };
}

export async function updateSettings(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  await connectToDatabase();

  const deadlineRaw = String(formData.get("teamFormationDeadline") ?? "");
  const formationPhaseOpen = formData.get("formationPhaseOpen") === "on";

  await SettingsModel.findByIdAndUpdate(
    SETTINGS_SINGLETON_ID,
    {
      teamFormationDeadline: deadlineRaw ? new Date(deadlineRaw) : null,
      formationPhaseOpen,
    },
    { upsert: true }
  );

  revalidatePath("/admin/settings");
  revalidatePath("/dashboard/team");
  return { success: true };
}
