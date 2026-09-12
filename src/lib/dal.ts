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

/**
 * Guards admin-only routes.
 *
 * Admin access is determined by the AdminRecord collection, NOT by the
 * user's organizational role. The JWT callback stamps `isAdmin` on the
 * session token at sign-in time, so no extra DB query is needed here.
 */
export async function requireAdmin(): Promise<User> {
  const session = await auth();

  // Not authenticated at all → send to sign-in
  if (!session?.user?.id) redirect("/login");

  // Authenticated but not in the AdminRecord table → member dashboard
  if (!session.user.isAdmin) redirect("/dashboard");

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
