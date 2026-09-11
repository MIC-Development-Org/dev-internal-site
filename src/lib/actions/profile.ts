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
  const photoUrl = String(formData.get("photoUrl") ?? "").trim();

  await UserModel.findByIdAndUpdate(user._id, { batch, photoUrl });

  revalidatePath("/dashboard/profile");
  return { success: true };
}
