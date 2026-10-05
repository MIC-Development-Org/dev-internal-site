import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel, type UserRole } from "@/models/User";
import { isAdminEmail } from "@/lib/admin-check";

export const ALLOWED_EMAIL_DOMAIN = "vitstudent.ac.in";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  trustHost: true,
  // Short-lived JWTs bound how long a stale role/team/admin flag can live.
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ profile }) {
      if (profile?.email_verified === false) return false;
      const email = profile?.email?.toLowerCase();
      if (!email) return false;

      const allowAnyEmail = process.env.ALLOW_ANY_EMAIL === "true" || process.env.NODE_ENV === "development";
      if (!allowAnyEmail && !email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
        console.warn(`Sign-in rejected for ${email}: domain must end with @${ALLOWED_EMAIL_DOMAIN}`);
        return false;
      }

      try {
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
      } catch (err) {
        console.error("Sign-in database error:", err);
        return false;
      }
    },
    async jwt({ token }) {
      if (!token.email) return token;

      await connectToDatabase();

      // Fetch member data
      const dbUser = await UserModel.findOne({ email: token.email });
      if (dbUser) {
        token.userId = dbUser._id.toString();
        token.role = dbUser.role as UserRole;
        token.teamId = dbUser.teamId ? dbUser.teamId.toString() : null;
      }

      // Check admin status from the dedicated AdminRecord collection.
      // An email in this collection has admin access regardless of their
      // User.role value. The two are completely independent.
      token.isAdmin = await isAdminEmail(token.email);

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
        session.user.role = (token.role as UserRole) ?? "fresher";
        session.user.teamId = (token.teamId as string | null) ?? null;
        session.user.isAdmin = Boolean(token.isAdmin);
      }
      return session;
    },
  },
});
