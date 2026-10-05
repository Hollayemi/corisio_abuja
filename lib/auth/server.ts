import { cache } from "react";
import { cookies } from "next/headers";
import { API_ROUTES } from "@/redux/config/apiRoutes";
import { isApiSuccess } from "@/redux/config/errors";
import type { User } from "@/redux/types";
import { TOKEN_COOKIE } from "./token";

/**
 * The signed-in user, for server components (route guards).
 * Reads the auth cookie and asks the backend who it belongs to, once per request.
 * Returns null when there's no cookie, or the backend doesn't accept the token.
 */
export const getServerUser = cache(async (): Promise<User | null> => {
  const raw = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!raw) return null;

  let token = raw;
  try {
    token = decodeURIComponent(raw);
  } catch {
    // use the raw value
  }

  const baseUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return null;

  try {
    const res = await fetch(`${baseUrl}${API_ROUTES.users.me}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;

    const body: unknown = await res.json();
    return isApiSuccess(body) ? (body.data as User) : null;
  } catch {
    return null;
  }
});
