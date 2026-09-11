import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      teamId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: UserRole;
    teamId?: string | null;
  }
}
