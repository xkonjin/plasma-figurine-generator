import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client for verification token storage
const getSupabase = () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    throw new Error("Missing Supabase credentials");
  }
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      id: "magic-link",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.token) {
          return null;
        }

        const email = (credentials.email as string).toLowerCase();
        const token = credentials.token as string;

        // Only allow @plasma.to emails
        if (!email.endsWith("@plasma.to")) {
          return null;
        }

        // Verify token from Supabase
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from("magic_tokens")
          .select("*")
          .eq("email", email)
          .eq("token", token)
          .gt("expires_at", new Date().toISOString())
          .single();

        if (error || !data) {
          return null;
        }

        // Delete used token
        await supabase.from("magic_tokens").delete().eq("id", data.id);

        return { id: email, email, name: email.split("@")[0] };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.id = token.sub || "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  trustHost: true,
});
