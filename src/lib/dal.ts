import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel, type User } from "@/models/User";
import { isAdminEmail } from "@/lib/admin-check";

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
 * Admin access is determined by the Admin collection, NOT by the user's
 * organizational role. The allowlist is re-checked on every call (one indexed
 * lookup) so revoking an admin takes effect immediately instead of waiting for
 * their JWT to expire.
 */
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Authenticated but not on the admin allowlist → member dashboard
  if (!(await isAdminEmail(user.email))) redirect("/dashboard");

  return user;
}
