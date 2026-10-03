import { API_ROUTES } from "../config/apiRoutes";
import type {
  ApiSuccess,
  ForgotPasswordRequest,
  RegisterRequest,
  User,
} from "../types";
import baseApi from "./baseApi";

/**
 * Sign in is handled by next-auth (see /auth.ts), which calls the backend's
 * login endpoint on the server. Register and forgot password go through RTK Query.
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiSuccess<User>, RegisterRequest>({
      query: (body) => ({
        url: API_ROUTES.auth.register,
        method: "POST",
        data: body,
      }),
    }),

    forgotPassword: builder.mutation<ApiSuccess<unknown>, ForgotPasswordRequest>({
      query: (body) => ({
        url: API_ROUTES.auth.forgotPassword,
        method: "POST",
        data: body,
      }),
    }),
  }),
});

export const { useRegisterMutation, useForgotPasswordMutation } = authApi;
