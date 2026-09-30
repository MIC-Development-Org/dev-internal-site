"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { fieldError, type ActionState } from "@/lib/actions/state";
import { parseHttpUrl } from "@/lib/url";
import { LIMITS, formString, parseTechStack, withinLength } from "@/lib/validation";

export async function updateProfile(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  await connectToDatabase();

  const batch = formString(formData, "batch");
  const hobbies = formString(formData, "hobbies");
  const techStack = parseTechStack(formString(formData, "techStack"));

  if (!withinLength(batch, LIMITS.shortText)) return fieldError("batch", "Batch is too long.");
  if (!withinLength(hobbies, LIMITS.hobbies)) return fieldError("hobbies", `Hobbies must be ${LIMITS.hobbies} characters or fewer.`);
  if (!techStack) return fieldError("techStack", `Up to ${LIMITS.techItems} items of ${LIMITS.techItem} characters each.`);

  // Optional links: blank clears the field, anything else must be a plain http(s) URL.
  const links: Record<"portfolioUrl" | "linkedinUrl" | "githubUrl", string> = {
    portfolioUrl: "",
    linkedinUrl: "",
    githubUrl: "",
  };
  for (const key of Object.keys(links) as (keyof typeof links)[]) {
    const raw = formString(formData, key);
    if (!raw) continue;
    const parsed = parseHttpUrl(raw);
    if (!parsed) return fieldError(key, "Enter a full URL starting with http:// or https://.");
    links[key] = parsed;
  }

  await UserModel.findByIdAndUpdate(user._id, { batch, hobbies, techStack, ...links });

  revalidatePath("/dashboard/profile");
  return { success: true };
}
