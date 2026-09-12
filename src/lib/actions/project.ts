"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { connectToDatabase } from "@/lib/mongodb";
import { TeamModel } from "@/models/Team";
import { ProjectModel } from "@/models/Project";
import type { ActionState } from "@/lib/actions/team";

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

  const projectId = String(formData.get("projectId") ?? "");
  if (!projectId) return { error: "Project ID is required." };

  const project = await ProjectModel.findById(projectId);
  if (!project) return { error: "Project not found." };
  if (project.teamId) return { error: "This project has already been claimed by another team." };

  project.teamId = team._id;
  await project.save();

  team.projectId = project._id;
  await team.save();

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

  const repoUrl = String(formData.get("repoUrl") ?? "").trim();
  const liveUrl = String(formData.get("liveUrl") ?? "").trim();
  const techStackRaw = String(formData.get("techStack") ?? "");
  const techStack = techStackRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!repoUrl) {
    return { error: "GitHub repository URL is required." };
  }

  project.repoUrl = repoUrl;
  if (liveUrl !== undefined) project.liveUrl = liveUrl;
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
export async function releaseProject(_prevState: ActionState, formData: FormData): Promise<ActionState> {
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
