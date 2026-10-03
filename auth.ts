import type { NextAuthOptions } from "next-auth";
import { encode } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { loginWithCredentials, loginWithGoogle } from "@/lib/auth/backend";

/** next-auth's default. Used when "Keep me signed in" is ticked (and for customers). */
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;
/** Used when "Keep me signed in" is unticked on the admin sign in. */
const SHORT_SESSION_MAX_AGE = 12 * 60 * 60;

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE },
  jwt: {
    // Sessions started without "Keep me signed in" expire sooner
    encode: (params) =>
      encode({
        ...params,
        maxAge:
          params.token?.remember === false
            ? SHORT_SESSION_MAX_AGE
            : params.maxAge,
      }),
  },
  pages: {
    error: '/error'
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Keep me signed in", type: "text" },
        type: { label: "Password", type: "text" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) return null;

        
        const result = await loginWithCredentials(email, password);

        if (!result) return null;

        return {
          id: String(result.user.id),
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          accessToken: result.accessToken,
          // Only the admin sign in sends this; everyone else keeps the default
          remember: credentials?.remember !== "false",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Email + password: authorize() already returned the backend token
      if (user?.accessToken) token.accessToken = user.accessToken;
      if (user) {
        token.role = user.role;
        token.remember = user.remember ?? true;
      }

      // Google: trade Google's ID token for the backend's token (first sign in only)
      if (account?.provider === "google" && account.id_token) {
        const result = await loginWithGoogle(account.id_token);
        if (result) {
          token.accessToken = result.accessToken;
          token.sub = String(result.user.id);
          token.name = result.user.name;
          token.role = result.user.role;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      session.user.role = typeof token.role === "string" ? token.role : undefined;
      session.accessToken =
        typeof token.accessToken === "string" ? token.accessToken : undefined;
      return session;
    },
  },
};