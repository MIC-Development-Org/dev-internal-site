"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import type { ActionState } from "@/lib/actions/team";

export async function updateProfile(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  await connectToDatabase();

  const batch = String(formData.get("batch") ?? "").trim();
  const hobbies = String(formData.get("hobbies") ?? "").trim();
  const techStack = String(formData.get("techStack") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const portfolioUrl = String(formData.get("portfolioUrl") ?? "").trim();
  const linkedinUrl = String(formData.get("linkedinUrl") ?? "").trim();
  const githubUrl = String(formData.get("githubUrl") ?? "").trim();

  await UserModel.findByIdAndUpdate(user._id, {
    batch,
    hobbies,
    techStack,
    portfolioUrl,
    linkedinUrl,
    githubUrl,
  });

  revalidatePath("/dashboard/profile");
  return { success: true };
}
