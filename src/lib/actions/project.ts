"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { connectToDatabase } from "@/lib/mongodb";
import { TeamModel } from "@/models/Team";
import { ProjectModel } from "@/models/Project";
import { fieldError, type ActionState } from "@/lib/actions/state";
import { parseGithubRepoUrl, parseHttpUrl } from "@/lib/url";
import { LIMITS, formString, parseObjectId, parseTechStack } from "@/lib/validation";

/**
 * Claim an available pool project for the user's team.
 * Only the team leader can pick/claim a project.
 */
export async function claimProject(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!user.teamId) return { error: "You must be in a team to select a project." };

  await connectToDatabase();
  const team = await TeamModel.findById(user.teamId);
  if (!team) return { error: "Team not found." };
  if (String(team.leaderId) !== String(user._id)) {
    return { error: "Only the team leader can pick a project for the team." };
  }

  if (team.projectId) {
    return { error: "Your team already has a project assigned." };
  }

  const projectId = parseObjectId(formData.get("projectId"));
  if (!projectId) return { error: "Project ID is required." };

  // Atomic claim: only succeeds if the project is still unclaimed, so two teams
  // racing for the same project can't both win.
  const project = await ProjectModel.findOneAndUpdate(
    { _id: projectId, teamId: null },
    { $set: { teamId: team._id } },
    { new: true }
  );
  if (!project) {
    const exists = await ProjectModel.exists({ _id: projectId });
    return { error: exists ? "This project has already been claimed by another team." : "Project not found." };
  }

  // Likewise only attach if the team still has no project (guards double-submit).
  const attached = await TeamModel.findOneAndUpdate(
    { _id: team._id, projectId: null },
    { $set: { projectId: project._id } }
  );
  if (!attached) {
    await ProjectModel.updateOne({ _id: project._id }, { $set: { teamId: null } });
    return { error: "Your team already has a project assigned." };
  }

  revalidatePath("/dashboard/project");
  revalidatePath("/dashboard/showcase");
  revalidatePath("/admin/projects");
  return { success: true };
}

/**
 * Update the GitHub Repository link (and optional live URL).
 * Only the team leader can add/update these links.
 */
export async function updateProjectGithub(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!user.teamId) return { error: "You need a team before updating project links." };

  await connectToDatabase();
  const team = await TeamModel.findById(user.teamId);
  if (!team) return { error: "Team not found." };
  if (String(team.leaderId) !== String(user._id)) {
    return { error: "Only the team leader can update the project GitHub repository link." };
  }

  if (!team.projectId) {
    return { error: "No project assigned to your team yet." };
  }

  const project = await ProjectModel.findById(team.projectId);
  if (!project) return { error: "Project not found." };

  const rawRepoUrl = formString(formData, "repoUrl");
  const rawLiveUrl = formString(formData, "liveUrl");
  const techStack = parseTechStack(formString(formData, "techStack"));
  if (!techStack) return fieldError("techStack", `Up to ${LIMITS.techItems} items of ${LIMITS.techItem} characters each.`);

  if (!rawRepoUrl) {
    return fieldError("repoUrl", "GitHub repository URL is required.");
  }
  const repoUrl = parseGithubRepoUrl(rawRepoUrl);
  if (!repoUrl) {
    return fieldError("repoUrl", "Enter a GitHub repository URL like https://github.com/owner/repo.");
  }
  const liveUrl = rawLiveUrl ? parseHttpUrl(rawLiveUrl) : "";
  if (liveUrl === null) {
    return fieldError("liveUrl", "Live URL must start with http:// or https://.");
  }

  project.repoUrl = repoUrl;
  project.liveUrl = liveUrl;
  if (techStack.length > 0) project.techStack = techStack;

  await project.save();

  revalidatePath("/dashboard/project");
  revalidatePath("/dashboard/showcase");
  revalidatePath("/admin/projects");
  return { success: true };
}

/**
 * Release / unclaim a project so the team can choose another one (allowed if still in submitted status).
 */
export async function releaseProject(): Promise<ActionState> {
  const user = await requireUser();
  if (!user.teamId) return { error: "You must be in a team." };

  await connectToDatabase();
  const team = await TeamModel.findById(user.teamId);
  if (!team) return { error: "Team not found." };
  if (String(team.leaderId) !== String(user._id)) {
    return { error: "Only the team leader can release the project." };
  }

  if (!team.projectId) return { error: "No project to release." };

  const project = await ProjectModel.findById(team.projectId);
  if (project) {
    if (project.status === "completed") {
      return { error: "Completed projects cannot be released." };
    }
    project.teamId = null;
    await project.save();
  }

  team.projectId = null;
  await team.save();

  revalidatePath("/dashboard/project");
  revalidatePath("/dashboard/showcase");
  revalidatePath("/admin/projects");
  return { success: true };
}

/**
 * Resubmit a project for review after changes were requested. Leader only.
 * The optional note is stored as a team reply next to the admin feedback.
 */
export async function resubmitProject(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!user.teamId) return { error: "You must be in a team." };

  await connectToDatabase();
  const team = await TeamModel.findById(user.teamId);
  if (!team) return { error: "Team not found." };
  if (String(team.leaderId) !== String(user._id)) {
    return { error: "Only the team leader can resubmit the project." };
  }
  if (!team.projectId) return { error: "No project assigned to your team." };

  const note = formString(formData, "note");
  if (note.length > LIMITS.note) return fieldError("note", `Note must be ${LIMITS.note} characters or fewer.`);

  // Atomic transition so a double-click or a concurrent admin update can't be overwritten.
  const updated = await ProjectModel.findOneAndUpdate(
    { _id: team.projectId, status: "changes_requested" },
    {
      $set: { status: "under_review" },
      $push: {
        feedback: { note: note || "Changes made — ready for another look.", author: "team", byUserId: user._id, at: new Date() },
      },
    }
  );
  if (!updated) return { error: "This project isn't waiting on changes." };

  revalidatePath("/dashboard/project");
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${team.projectId}`);
  return { success: true };
}
