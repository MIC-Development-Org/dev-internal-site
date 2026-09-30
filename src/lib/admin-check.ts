import { connectToDatabase } from "@/lib/mongodb";
import { AdminModel } from "@/models/Admin";

/** True if the email has an entry in the Admin allowlist collection. */
export async function isAdminEmail(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  await connectToDatabase();
  return (await AdminModel.exists({ email: email.toLowerCase() })) !== null;
}
