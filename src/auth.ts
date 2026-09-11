import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel, type UserRole } from "@/models/User";

export const ALLOWED_EMAIL_DOMAIN = "vitstudent.ac.in";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email?.toLowerCase();
      if (!email || !email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) return false;

      await connectToDatabase();
      const existing = await UserModel.findOne({ email });
      if (!existing) {
        await UserModel.create({
          name: profile?.name ?? email,
          email,
          photoUrl: typeof profile?.picture === "string" ? profile.picture : "",
          role: "fresher",
          teamId: null,
          points: 0,
        });
      }
      return true;
    },
    async jwt({ token }) {
      if (!token.email) return token;

      await connectToDatabase();
      const dbUser = await UserModel.findOne({ email: token.email });
      if (dbUser) {
        token.userId = dbUser._id.toString();
        token.role = dbUser.role;
        token.teamId = dbUser.teamId ? dbUser.teamId.toString() : null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
        session.user.role = (token.role as UserRole) ?? "fresher";
        session.user.teamId = (token.teamId as string | null) ?? null;
      }
      return session;
    },
  },
});
