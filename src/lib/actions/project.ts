"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { connectToDatabase } from "@/lib/mongodb";
import { TeamModel } from "@/models/Team";
import { ProjectModel } from "@/models/Project";
import type { ActionState } from "@/lib/actions/team";

export async function submitProject(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!user.teamId) return { error: "You need a team before you can submit a project." };

  await connectToDatabase();
  const team = await TeamModel.findById(user.teamId);
  if (!team) return { error: "Team not found." };
  if (String(team.leaderId) !== String(user._id)) {
    return { error: "Only the team leader can submit the project." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const techStack = String(formData.get("techStack") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const repoUrl = String(formData.get("repoUrl") ?? "").trim();
  const liveUrl = String(formData.get("liveUrl") ?? "").trim();

  if (!title || !description) return { error: "Title and description are required." };

  const existing = await ProjectModel.findOne({ teamId: team._id });
  if (existing) {
    if (existing.status === "completed") {
      return { error: "This project is marked completed and can no longer be edited." };
    }
    existing.title = title;
    existing.description = description;
    existing.techStack = techStack;
    existing.repoUrl = repoUrl;
    existing.liveUrl = liveUrl;
    await existing.save();
  } else {
    const project = await ProjectModel.create({
      teamId: team._id,
      title,
      description,
      techStack,
      repoUrl,
      liveUrl,
      status: "submitted",
    });
    team.projectId = project._id;
    await team.save();
  }

  revalidatePath("/dashboard/project");
  return { success: true };
}
