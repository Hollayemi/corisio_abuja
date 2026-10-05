/**
 * Where the backend's access token lives: one cookie.
 *
 *  - The browser reads it to add `Authorization: Bearer ...` to API calls.
 *  - Next.js server components read the same cookie (see ./server.ts) to guard
 *    the admin / store-owner pages before anything renders.
 *
 * "Keep me signed in" (LoginDto.rememberMe) decides the lifetime: ticked, the
 * cookie lasts 30 days; unticked, it's a session cookie that goes when the
 * browser closes.
 *
 * Trade-off: the cookie is readable by JavaScript (it has to be, because the
 * browser calls the NestJS API directly). If you want httpOnly, move login /
 * register / google behind Next route handlers that set the cookie, and proxy API calls.
 */

export const TOKEN_COOKIE = "corisio_token";

const REMEMBER_MAX_AGE = 30 * 24 * 60 * 60;

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

/** Subscribe to token changes (sign in / sign out / expiry). Returns the unsubscribe. */
export function subscribeToken(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readToken(): string | null {
  if (typeof document === "undefined") return null;

  for (const part of document.cookie.split("; ")) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq) === TOKEN_COOKIE) {
      try {
        return decodeURIComponent(part.slice(eq + 1)) || null;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function writeToken(token: string, remember = true) {
  if (typeof document === "undefined") return;

  const parts = [
    `${TOKEN_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "SameSite=Lax",
  ];
  if (remember) parts.push(`Max-Age=${REMEMBER_MAX_AGE}`);
  if (window.location.protocol === "https:") parts.push("Secure");

  document.cookie = parts.join("; ");
  emit();
}

export function clearToken() {
  if (typeof document === "undefined") return;
  if (readToken() === null) return;

  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  emit();
}
