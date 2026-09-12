import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      teamId: string | null;
      /** True if the signed-in email exists in the AdminRecord collection. */
      isAdmin: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: UserRole;
    teamId?: string | null;
    /** Stamped at sign-in from the AdminRecord collection. */
    isAdmin?: boolean;
  }
}
