import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Resend({
      from: "Plasma Figurines <figurines@plasma.to>",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Only allow @plasma.to emails
      const email = user.email?.toLowerCase();
      if (!email || !email.endsWith("@plasma.to")) {
        return false;
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
    error: "/login",
  },
  trustHost: true,
});
