import axios, { type AxiosRequestConfig } from "axios";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { isApiFailure, isApiSuccess, toApiError } from "./errors";
import type { ApiError, ApiSuccess } from "../types";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15_000,
  // No default Content-Type — axios sets it per request.
  // JSON → application/json. FormData → multipart/form-data; boundary=...
});

export type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  headers?: Record<string, string | undefined>;
};

const axiosBaseQuery = (): BaseQueryFn<AxiosBaseQueryArgs, unknown, ApiError> =>
  async ({ url, method = "GET", data, params, headers }, { getState, signal }) => {
    const token = (
      getState() as { session?: { accessToken?: string | null } }
    ).session?.accessToken;

    try {
      const response = await axiosInstance.request({
        url,
        method,
        data,
        params,
        signal,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
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