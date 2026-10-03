import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: { id: string; role?: string } & DefaultSession["user"];
    /** Access token issued by the NestJS backend */
    accessToken?: string;
  }

  interface User {
    accessToken?: string;
    role?: string;
    /** false = "Keep me signed in" was unticked (shorter session) */
    remember?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    role?: string;
    remember?: boolean;
  }
}
