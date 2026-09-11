import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel, type User } from "@/models/User";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectToDatabase();
  const user = await UserModel.findById(session.user.id);
  return user;
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}
