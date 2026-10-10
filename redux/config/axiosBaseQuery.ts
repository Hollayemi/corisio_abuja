import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { clearToken, readToken } from "@/lib/auth/token";
import { reportUnauthorized } from "@/lib/auth/unauthorized";
import { isApiFailure, isApiSuccess, toApiError } from "./errors";
import type { ApiError, ApiSuccess } from "../types";
import { locationHeaders } from "@/lib/location/store";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15_000,
  // No default Content-Type — axios sets it per request.
  // JSON → application/json. FormData → multipart/form-data; boundary=...
});

// Every request (RTK Query and the React Query auth hooks) carries the signed-in
// user's token, read from the auth cookie at send time.
//
// It also carries the visitor's location (X-User-Lat / X-User-Lng) when we know it,
// so the backend can put the closest stores and products first without every
// endpoint having to take coordinates. See lib/location/store.ts.
axiosInstance.interceptors.request.use((config) => {
  const token = readToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  for (const [name, value] of Object.entries(locationHeaders())) {
    if (!config.headers.has(name)) config.headers.set(name, value);
  }
  return config;
});

// A 401 means "sign in first" (no token) or "your session ran out" (the token was
// rejected). Either way: drop a rejected token so the app flips to signed out, and tell
// the sign-in prompt (lib/auth/unauthorized.ts) so it can open the login dialog.
//
// The backend sends 401 as a real HTTP status, but its error body also carries the code
// (errorDetails.statusCode), so both are checked.
function handleUnauthorized(config: InternalAxiosRequestConfig | undefined) {
  const hadToken = !!config?.headers?.has("Authorization");
  if (hadToken) clearToken();
  reportUnauthorized({ url: config?.url, method: config?.method, hadToken });
}

const is401Body = (body: unknown) => isApiFailure(body) && body.errorDetails.statusCode === 401;

axiosInstance.interceptors.response.use(
  (response) => {
    if (is401Body(response.data)) handleUnauthorized(response.config);
    return response;
  },
  (error: unknown) => {
    if (axios.isAxiosError(error) && (error.response?.status === 401 || is401Body(error.response?.data))) {
      handleUnauthorized(error.config);
    }
    return Promise.reject(error);
  },
);

export type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  headers?: Record<string, string | undefined>;
};

const axiosBaseQuery = (): BaseQueryFn<AxiosBaseQueryArgs, unknown, ApiError> =>
  async ({ url, method = "GET", data, params, headers }, { signal }) => {
    try {
      const response = await axiosInstance.request({
        url,
        method,
        data,
        params,
        signal,
        headers,
      });

      const body: unknown = response.data;

      if (isApiFailure(body)) return { error: toApiError(body) };
      if (isApiSuccess(body)) return { data: body };

      const fallback: ApiSuccess<unknown> = {
        success: true,
        message: "",
        data: body ?? null,
      };
      return { data: fallback };
    } catch (error) {
      return { error: toApiError(error) };
    }
  };

export default axiosBaseQuery;