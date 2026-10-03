import axios from "axios";
import type { ApiError, ApiFailure, ApiSuccess } from "../types";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

export function isApiSuccess(body: unknown): body is ApiSuccess<unknown> {
  return isRecord(body) && body.success === true;
}

export function isApiFailure(body: unknown): body is ApiFailure {
  return isRecord(body) && body.error === true && isRecord(body.errorDetails);
}

/** True for errors that were already normalized by axiosBaseQuery */
export function isApiError(value: unknown): value is ApiError {
  return (
    isRecord(value) &&
    typeof value.status === "number" &&
    typeof value.message === "string" &&
    Array.isArray(value.messages)
  );
}

/* ------------------------------------------------------------------ */
/* Normalizing                                                         */
/* ------------------------------------------------------------------ */

const STATUS_MESSAGES: Record<number, string> = {
  400: "That request wasn't valid. Please check your details.",
  401: "Please sign in to continue.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: "That already exists.",
  429: "Too many attempts. Please wait a moment and try again.",
};

const SERVER_ERROR = "Something went wrong on our side. Please try again.";
const NETWORK_ERROR =
  "We couldn't reach the server. Check your connection and try again.";
const TIMEOUT_ERROR = "The request took too long. Please try again.";
const UNKNOWN_ERROR = "Something went wrong. Please try again.";

const statusFallback = (status: number) =>
  STATUS_MESSAGES[status] ?? (status >= 500 ? SERVER_ERROR : UNKNOWN_ERROR);

function fromFailure(body: ApiFailure): ApiError {
  const { statusCode, message, path, timestamp } = body.errorDetails;

  const messages = (Array.isArray(message) ? message : [message]).filter(
    (m): m is string => typeof m === "string" && m.length > 0,
  );
  const list = messages.length > 0 ? messages : [statusFallback(statusCode)];

  return { status: statusCode, message: list[0], messages: list, path, timestamp };
}

export function toApiError(input: unknown): ApiError {
  if (isApiError(input)) return input;
  if (isApiFailure(input)) return fromFailure(input);

  if (axios.isAxiosError(input)) {
    const body = input.response?.data;
    if (isApiFailure(body)) return fromFailure(body);

    if (input.response) {
      const message = statusFallback(input.response.status);
      return { status: input.response.status, message, messages: [message] };
    }

    const message =
      input.code === "ECONNABORTED" ? TIMEOUT_ERROR : NETWORK_ERROR;
    return { status: 0, message, messages: [message], isNetworkError: true };
  }

  return { status: 0, message: UNKNOWN_ERROR, messages: [UNKNOWN_ERROR] };
}

/**
 * A user-facing message from anything a failed .unwrap() throws.
 *   try { await register(body).unwrap() } catch (e) { setError(getErrorMessage(e)) }
 */
export function getErrorMessage(error: unknown, fallback = UNKNOWN_ERROR) {
  if (isApiError(error)) return error.message;
  if (isApiFailure(error) || axios.isAxiosError(error)) {
    return toApiError(error).message;
  }
  return fallback;
}
