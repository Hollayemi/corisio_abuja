import { axiosInstance } from "@/redux/config/axiosBaseQuery";
import { API_ROUTES } from "@/redux/config/apiRoutes";
import { isApiFailure, isApiSuccess, toApiError } from "@/redux/config/errors";
import type {
  AuthPayload,
  CreateStoreRequest,
  ForgotPasswordRequest,
  GoogleRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  StoreSummary,
  User,
} from "@/redux/types";

/**
 * Plain functions for the NestJS auth endpoints. The React Query hooks in
 * ./hooks.ts call these. Whatever goes wrong, they throw an `ApiError`, so
 * getErrorMessage(error) works on anything a failed mutation hands back.
 */
async function call<T>(config: Parameters<typeof axiosInstance.request>[0]): Promise<T> {
  try {
    const { data: body } = await axiosInstance.request(config);
    if (isApiFailure(body)) throw toApiError(body);
    return (isApiSuccess(body) ? body.data : body) as T;
  } catch (error) {
    throw toApiError(error);
  }
}

export const authApi = {
  register: (body: RegisterRequest) =>
    call<unknown>({ url: API_ROUTES.auth.register, method: "POST", data: body }),

  login: (body: LoginRequest) =>
    call<AuthPayload>({ url: API_ROUTES.auth.login, method: "POST", data: body }),

  google: (body: GoogleRequest) =>
    call<AuthPayload>({ url: API_ROUTES.auth.google, method: "POST", data: body }),

  forgotPassword: (body: ForgotPasswordRequest) =>
    call<unknown>({ url: API_ROUTES.auth.forgotPassword, method: "POST", data: body }),

  resetPassword: (body: ResetPasswordRequest) =>
    call<unknown>({ url: API_ROUTES.auth.resetPassword, method: "POST", data: body }),

  /** The signed-in user (needs the token). */
  me: () => call<User>({ url: API_ROUTES.users.me, method: "GET" }),

  createStore: (body: CreateStoreRequest) =>
    call<StoreSummary | null>({ url: API_ROUTES.stores.create, method: "POST", data: body }),
};
