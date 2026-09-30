"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/dal";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel, USER_ROLES, type UserRole } from "@/models/User";
import { TeamModel } from "@/models/Team";
import { ProjectModel, PROJECT_STATUSES, type ProjectStatus } from "@/models/Project";
import { PointsLogModel, type PointsTargetType } from "@/models/PointsLog";
import { SettingsModel, SETTINGS_SINGLETON_ID } from "@/models/Settings";
import { deleteTeamCascade } from "@/lib/data/teams";
import { logAdminAction } from "@/lib/audit";
import { fieldError, type ActionState } from "@/lib/actions/state";
import { parseHttpUrl } from "@/lib/url";
import {
  LIMITS,
  formString,
  parseList,
  parseObjectId,
  parseOptionalDate,
  parsePointsAmount,
  parseTechStack,
  withinLength,
} from "@/lib/validation";

function revalidateProjectPaths(projectId?: string) {
  revalidatePath("/admin/projects");
  if (projectId) revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/dashboard/project");
  revalidatePath("/dashboard/showcase");
}

export async function setUserRole(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const userId = parseObjectId(formData.get("userId"));
  const role = formString(formData, "role");
  if (!userId) return { error: "Invalid user." };
  if (!USER_ROLES.includes(role as UserRole)) return { error: "Invalid role." };

  const target = await UserModel.findById(userId);
  if (!target) return { error: "User not found." };

  const previousRole = target.role;
  target.role = role as UserRole;
  await target.save();

  if (previousRole !== role) {
    await logAdminAction(
      admin,
      "role_changed",
      `Changed ${target.name}'s role from ${previousRole} to ${role}`
    );
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function manualCreateTeam(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const name = formString(formData, "name");
  const leaderId = parseObjectId(formData.get("leaderId"));
  const memberIds = parseList(formString(formData, "memberIds"));

  if (!name || !leaderId) return { error: "Team name and leader are required." };
  if (!withinLength(name, LIMITS.name)) return fieldError("name", `Team name must be ${LIMITS.name} characters or fewer.`);
  if (memberIds.some((id) => !parseObjectId(id))) return { error: "Invalid member selection." };
  if (!memberIds.includes(leaderId)) memberIds.push(leaderId);

  const existingCount = await UserModel.countDocuments({ _id: { $in: memberIds } });
  if (existingCount !== memberIds.length) return { error: "One or more selected members no longer exist." };

  const alreadyTeamed = await UserModel.find({ _id: { $in: memberIds }, teamId: { $ne: null } }).select("email");
  if (alreadyTeamed.length > 0) {
    return { error: `Already on a team: ${alreadyTeamed.map((u) => u.email).join(", ")}` };
  }

  const leader = await UserModel.findById(leaderId).select("name");
  const team = await TeamModel.create({ name, leaderId, memberIds, points: 0 });
  await UserModel.updateMany({ _id: { $in: memberIds } }, { $set: { teamId: team._id } });

  await logAdminAction(
    admin,
    "team_created",
    `Created team "${name}" (${memberIds.length} members, leader ${leader?.name ?? "unknown"})`
  );

  revalidatePath("/admin/teams");
  return { success: true };
}

export async function editTeamRoster(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const teamId = parseObjectId(formData.get("teamId"));
  const name = formString(formData, "name");
  const leaderId = parseObjectId(formData.get("leaderId"));
  const memberIds = parseList(formString(formData, "memberIds"));

  if (!teamId) return { error: "Invalid team." };
  if (!leaderId) return { error: "A team leader is required." };
  if (!withinLength(name, LIMITS.name)) return fieldError("name", `Team name must be ${LIMITS.name} characters or fewer.`);
  if (memberIds.some((id) => !parseObjectId(id))) return { error: "Invalid member selection." };

  const team = await TeamModel.findById(teamId);
  if (!team) return { error: "Team not found." };
  if (!memberIds.includes(leaderId)) memberIds.push(leaderId);

  const existingCount = await UserModel.countDocuments({ _id: { $in: memberIds } });
  if (existingCount !== memberIds.length) return { error: "One or more selected members no longer exist." };

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

  const previousName = team.name;
  team.name = name || team.name;
  team.leaderId = new Types.ObjectId(leaderId);
  team.memberIds = memberIds.map((id) => new Types.ObjectId(id));
  await team.save();

  if (removed.length) await UserModel.updateMany({ _id: { $in: removed } }, { $set: { teamId: null } });
  if (added.length) await UserModel.updateMany({ _id: { $in: added } }, { $set: { teamId: team._id } });

  await logAdminAction(
    admin,
    "team_roster_updated",
    `Updated "${previousName}"'s roster (+${added.length}/-${removed.length} members)`
  );

  revalidatePath("/admin/teams");
  revalidatePath(`/admin/teams/${teamId}`);
  return { success: true };
}

export async function dissolveTeam(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const teamId = parseObjectId(formData.get("teamId"));
  if (!teamId) return { error: "Invalid team." };

  await connectToDatabase();
  const team = await TeamModel.findById(teamId).select("name");
  if (!team) return { error: "Team not found." };

  await deleteTeamCascade(teamId);
  await logAdminAction(admin, "team_dissolved", `Dissolved team "${team.name}"`);

  revalidatePath("/admin/teams");
  revalidatePath("/admin/projects");
  revalidatePath("/dashboard/project");
  return { success: true };
}

export async function updateProjectStatus(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const projectId = parseObjectId(formData.get("projectId"));
  const status = formString(formData, "status");
  const note = formString(formData, "note");

  if (!projectId) return { error: "Invalid project." };
  if (!PROJECT_STATUSES.includes(status as ProjectStatus)) return { error: "Invalid status." };
  if (!withinLength(note, LIMITS.note)) return fieldError("note", `Note must be ${LIMITS.note} characters or fewer.`);
  if (status === "changes_requested" && !note) {
    return fieldError("note", "Tell the team what to change before requesting changes.");
  }

  const project = await ProjectModel.findById(projectId);
  if (!project) return { error: "Project not found." };

  const previousStatus = project.status;
  project.status = status as ProjectStatus;
  if (note) {
    project.feedback.push({ note, author: "admin", byAdminId: admin._id, at: new Date() });
  }
  await project.save();

  if (previousStatus !== status) {
    await logAdminAction(
      admin,
      "project_status_changed",
      `Set "${project.title}" status from ${previousStatus} to ${status}`
    );
  }

  revalidateProjectPaths(projectId);
  return { success: true };
}

export async function awardPoints(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const targetType = formString(formData, "targetType") as PointsTargetType;
  const targetId = parseObjectId(formData.get("targetId"));
  const amount = parsePointsAmount(formData.get("amount"));
  const reason = formString(formData, "reason");

  if (!["user", "team"].includes(targetType)) return { error: "Invalid target type." };
  if (!targetId) return { error: "Pick a valid target." };
  if (amount === null) return fieldError("amount", `Enter a non-zero whole number up to ±${LIMITS.maxPoints}.`);
  if (!reason) return fieldError("reason", "A reason is required.");
  if (!withinLength(reason, LIMITS.reason)) return fieldError("reason", `Reason must be ${LIMITS.reason} characters or fewer.`);

  // Atomic $inc avoids lost updates when two admins award points concurrently.
  const update = { $inc: { points: amount } };
  const target =
    targetType === "user"
      ? await UserModel.findByIdAndUpdate(targetId, update, { new: true }).select("name")
      : await TeamModel.findByIdAndUpdate(targetId, update, { new: true }).select("name");
  if (!target) return { error: "Target not found." };

  await PointsLogModel.create({ targetId, targetType, amount, reason, awardedBy: admin._id });
  await logAdminAction(
    admin,
    "points_awarded",
    `Awarded ${amount > 0 ? "+" : ""}${amount} points to ${targetType} "${target.name}" (${reason})`
  );

  revalidatePath("/admin/leaderboard");
  revalidatePath("/dashboard/leaderboard");
  return { success: true };
}

export async function updateSettings(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const deadlineRaw = formString(formData, "teamFormationDeadline");
  const formationPhaseOpen = formData.get("formationPhaseOpen") === "on";
  const deadline = parseOptionalDate(deadlineRaw);
  if (deadline === undefined) return { error: "Enter a valid deadline date." };

  await SettingsModel.findByIdAndUpdate(
    SETTINGS_SINGLETON_ID,
    {
      teamFormationDeadline: deadline,
      formationPhaseOpen,
    },
    { upsert: true }
  );

  await logAdminAction(
    admin,
    "settings_updated",
    `Updated team formation settings (deadline: ${deadlineRaw || "none"}, phase ${formationPhaseOpen ? "open" : "closed"})`
  );

  revalidatePath("/admin/settings");
  revalidatePath("/dashboard/team");
  return { success: true };
}

export async function adminCreateProject(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const title = formString(formData, "title");
  const description = formString(formData, "description");
  const rawTeamId = formString(formData, "teamId");
  const teamId = rawTeamId ? parseObjectId(rawTeamId) : null;

  if (!title) return fieldError("title", "Title is required.");
  if (!description) return fieldError("description", "Description is required.");
  if (!withinLength(title, LIMITS.title)) return fieldError("title", `Title must be ${LIMITS.title} characters or fewer.`);
  if (!withinLength(description, LIMITS.description)) {
    return fieldError("description", `Description must be ${LIMITS.description} characters or fewer.`);
  }
  if (rawTeamId && !teamId) return { error: "Invalid team." };

  let assignedTeam = null;
  if (teamId) {
    assignedTeam = await TeamModel.findById(teamId);
    if (!assignedTeam) return { error: "Assigned team not found." };
    if (assignedTeam.projectId) return { error: "That team already has a project." };
  }

  const project = await ProjectModel.create({
    title,
    description,
    techStack: [],
    repoUrl: "",
    liveUrl: "",
    status: "submitted",
    teamId: assignedTeam ? assignedTeam._id : null,
  });

  if (assignedTeam) {
    assignedTeam.projectId = project._id;
    await assignedTeam.save();
  }

  await logAdminAction(
    admin,
    "project_created",
    `Created project "${title}"${assignedTeam ? ` and assigned to team "${assignedTeam.name}"` : " (Unassigned)"}`
  );

  revalidateProjectPaths();
  return { success: true };
}

export async function adminEditProject(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const projectId = parseObjectId(formData.get("projectId"));
  const title = formString(formData, "title");
  const description = formString(formData, "description");
  const techStack = parseTechStack(formString(formData, "techStack"));
  const rawRepoUrl = formString(formData, "repoUrl");
  const rawLiveUrl = formString(formData, "liveUrl");
  const repoUrl = rawRepoUrl ? parseHttpUrl(rawRepoUrl) : "";
  const liveUrl = rawLiveUrl ? parseHttpUrl(rawLiveUrl) : "";
  const status = (formString(formData, "status") || "submitted") as ProjectStatus;
  const rawTeamId = formString(formData, "teamId");
  const newTeamId = rawTeamId ? parseObjectId(rawTeamId) : null;

  if (!projectId) return { error: "Project ID is required." };
  if (!title) return fieldError("title", "Title is required.");
  if (!description) return fieldError("description", "Description is required.");
  if (!withinLength(title, LIMITS.title)) return fieldError("title", `Title must be ${LIMITS.title} characters or fewer.`);
  if (!withinLength(description, LIMITS.description)) {
    return fieldError("description", `Description must be ${LIMITS.description} characters or fewer.`);
  }
  if (!techStack) return fieldError("techStack", `Up to ${LIMITS.techItems} items of ${LIMITS.techItem} characters each.`);
  if (!PROJECT_STATUSES.includes(status)) return { error: "Invalid project status." };
  if (repoUrl === null) return fieldError("repoUrl", "Repository URL must start with http:// or https://.");
  if (liveUrl === null) return fieldError("liveUrl", "Live URL must start with http:// or https://.");
  if (rawTeamId && !newTeamId) return { error: "Invalid team." };

  const project = await ProjectModel.findById(projectId);
  if (!project) return { error: "Project not found." };

  const oldTeamId = project.teamId ? String(project.teamId) : null;

  if (oldTeamId !== newTeamId) {
    // Validate the destination before touching anything so a failure leaves no half-applied state.
    const newTeam = newTeamId ? await TeamModel.findById(newTeamId) : null;
    if (newTeamId) {
      if (!newTeam) return { error: "New assigned team not found." };
      if (newTeam.projectId && String(newTeam.projectId) !== projectId) {
        return { error: "That team already has a project." };
      }
    }

    if (oldTeamId) await TeamModel.findByIdAndUpdate(oldTeamId, { $set: { projectId: null } });
    if (newTeam) {
      newTeam.projectId = project._id;
      await newTeam.save();
    }
    project.teamId = newTeam ? newTeam._id : null;
  }

  project.title = title;
  project.description = description;
  project.techStack = techStack;
  project.repoUrl = repoUrl;
  project.liveUrl = liveUrl;
  project.status = status;

  await project.save();

  await logAdminAction(admin, "project_updated", `Updated project "${title}" details and assignment`);

  revalidateProjectPaths(projectId);
  return { success: true };
}

export async function adminDeleteProject(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const projectId = parseObjectId(formData.get("projectId"));
  if (!projectId) return { error: "Project ID is required." };

  const project = await ProjectModel.findById(projectId);
  if (!project) return { error: "Project not found." };

  const projectTitle = project.title;

  // Unlink any team that holds this project
  await TeamModel.updateMany({ projectId: project._id }, { $set: { projectId: null } });

  // Delete project
  await ProjectModel.findByIdAndDelete(projectId);

  await logAdminAction(admin, "project_deleted", `Deleted project "${projectTitle}"`);

  revalidateProjectPaths();
  return { success: true };
}

const MAX_BULK_TARGETS = 200;

/** Parses the repeated `userIds` form field into a bounded, de-duplicated list of valid ids. */
function parseBulkUserIds(formData: FormData): string[] | null {
  const ids = Array.from(new Set(formData.getAll("userIds").map((v) => parseObjectId(v))));
  if (ids.length === 0 || ids.length > MAX_BULK_TARGETS || ids.some((id) => id === null)) return null;
  return ids as string[];
}

export async function bulkAwardPoints(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const userIds = parseBulkUserIds(formData);
  const amount = parsePointsAmount(formData.get("amount"));
  const reason = formString(formData, "reason");

  if (!userIds) return { error: `Select between 1 and ${MAX_BULK_TARGETS} members.` };
  if (amount === null) return fieldError("amount", `Enter a non-zero whole number up to ±${LIMITS.maxPoints}.`);
  if (!reason) return fieldError("reason", "A reason is required.");
  if (!withinLength(reason, LIMITS.reason)) return fieldError("reason", `Reason must be ${LIMITS.reason} characters or fewer.`);

  const existing = await UserModel.find({ _id: { $in: userIds } }).select("_id");
  const existingIds = existing.map((u) => u._id);
  if (existingIds.length === 0) return { error: "None of the selected members exist anymore." };

  await UserModel.updateMany({ _id: { $in: existingIds } }, { $inc: { points: amount } });
  await PointsLogModel.insertMany(
    existingIds.map((id) => ({ targetId: id, targetType: "user", amount, reason, awardedBy: admin._id }))
  );
  await logAdminAction(
    admin,
    "points_awarded",
    `Awarded ${amount > 0 ? "+" : ""}${amount} points to ${existingIds.length} members (${reason})`
  );

  revalidatePath("/admin/users");
  revalidatePath("/admin/leaderboard");
  revalidatePath("/dashboard/leaderboard");
  return { success: true };
}

export async function bulkSetRole(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  await connectToDatabase();

  const userIds = parseBulkUserIds(formData);
  const role = formString(formData, "role");
  if (!userIds) return { error: `Select between 1 and ${MAX_BULK_TARGETS} members.` };
  if (!USER_ROLES.includes(role as UserRole)) return fieldError("role", "Choose a role.");

  const newRole = role as UserRole;
  const result = await UserModel.updateMany({ _id: { $in: userIds }, role: { $ne: newRole } }, { $set: { role: newRole } });
  if (result.modifiedCount > 0) {
    await logAdminAction(admin, "role_changed", `Changed ${result.modifiedCount} members to ${role} (bulk)`);
  }

  revalidatePath("/admin/users");
  return { success: true };
}
