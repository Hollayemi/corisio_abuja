import { API_ROUTES } from "@/redux/config/apiRoutes";

/**
 * "Some API call came back 401: ask the visitor to sign in."
 *
 * The axios interceptor (redux/config/axiosBaseQuery.ts) lives outside React, but the
 * sign-in dialog is a React thing. This is the bridge, the same shape as ./token.ts:
 * the interceptor calls reportUnauthorized(), and <UnauthorizedPrompt /> (mounted once
 * in AppProviders) listens and opens the dialog.
 */

export type UnauthorizedEvent = {
  /** The request carried a token, so the visitor *was* signed in: their session ran out. */
  sessionExpired: boolean;
};

type Listener = (event: UnauthorizedEvent) => void;
const listeners = new Set<Listener>();

/** Returns the unsubscribe. */
export function subscribeUnauthorized(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * These answer 401 as a normal result ("wrong email or password"), and the form already
 * shows that message. Opening the dialog on top of the form would be wrong.
 */
const SIGN_IN_FORM_ROUTES = [
  API_ROUTES.auth.login,
  API_ROUTES.auth.register,
  API_ROUTES.auth.google,
  API_ROUTES.auth.forgotPassword,
  API_ROUTES.auth.resetPassword,
];

/** The request's path without the query string or the host, whatever form the url is in. */
function pathOf(url: string | undefined): string {
  if (!url) return "";
  const noQuery = url.split("?")[0];
  try {
    return noQuery.startsWith("http") ? new URL(noQuery).pathname : noQuery;
  } catch {
    return noQuery;
  }
}

/**
 * Whether a 401 on this request should open the sign-in dialog.
 * (endsWith, because the API may sit under a prefix like /api.)
 */
export function shouldPromptSignIn(url: string | undefined, method: string | undefined): boolean {
  const path = pathOf(url).replace(/\/+$/, "");

  if (SIGN_IN_FORM_ROUTES.some((route) => path.endsWith(route))) return false;

  // The quiet "who am I?" check that runs when a page loads. A stale cookie just means
  // "signed out": every page still works for guests, so don't interrupt with a dialog.
  if ((method ?? "get").toLowerCase() === "get" && path.endsWith(API_ROUTES.users.me)) return false;

  return true;
}

export function reportUnauthorized(request: {
  url?: string;
  method?: string;
  hadToken: boolean;
}) {
  if (typeof window === "undefined") return;
  if (!shouldPromptSignIn(request.url, request.method)) return;

  const event: UnauthorizedEvent = { sessionExpired: request.hadToken };
  listeners.forEach((listener) => listener(event));
}
