import axios from "axios";
import { API_ROUTES } from "@/redux/config/apiRoutes";
import { isApiSuccess } from "@/redux/config/errors";
import type { ApiResponse, AuthPayload } from "@/redux/types";

/**
 * Server-side calls to the NestJS backend, used by next-auth (see /auth.ts).
 * They run on the server, so API_URL can be a private/internal address.
 */
const backend = axios.create({
  baseURL: process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL,
  timeout: 15_000,
});

async function post(url: string, body: unknown): Promise<AuthPayload | null> {
  try {
    const { data } = await backend.post<ApiResponse<AuthPayload>>(url, body);
    return isApiSuccess(data) ? (data.data as AuthPayload) : null;
  } catch {
    return null;
  }
}

/** Email + password sign in. Returns null when the credentials are wrong. */
export function loginWithCredentials(email: string, password: string) {
  return post(API_ROUTES.auth.login, { email, password });
}

/** Exchanges the Google ID token for the backend's own access token. */
export function loginWithGoogle(idToken: string) {
  return post(API_ROUTES.auth.google, { idToken });
}

