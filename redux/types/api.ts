/**
 * Shapes of the responses the NestJS backend sends.
 *
 * Success:  { success: true, message: "...", data: {...} }
 * Failure:  { error: true, errorDetails: { statusCode, timestamp, path, message } }
 */

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorDetails = {
  statusCode: number;
  timestamp: string;
  path: string;
  /** NestJS validation errors (class-validator) come back as an array */
  message: string | string[];
};

export type ApiFailure = {
  error: true;
  errorDetails: ApiErrorDetails;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/**
 * The error every RTK Query call rejects with (see axiosBaseQuery.ts).
 * It is always this shape, whatever went wrong: the API answered with an
 * error, the request timed out or the network was down.
 */
export type ApiError = {
  /** HTTP status, or 0 when there was no response (network error / timeout) */
  status: number;
  /** One message that is safe to show to the user */
  message: string;
  /** All messages (validation errors can have several) */
  messages: string[];
  path?: string;
  timestamp?: string;
  isNetworkError?: boolean;
};
