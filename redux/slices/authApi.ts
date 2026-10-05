import { API_ROUTES } from "../config/apiRoutes";
import type {
  ApiSuccess,
  AuthPayload,
  CreateStoreRequest,
  ForgotPasswordRequest,
  GoogleRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  StoreSummary,
  User,
} from "../types";
import baseApi from "./baseApi";

/**
 * Auth endpoints, one per NestJS DTO. The component-facing hooks
 * (useAuth, useLogin, useRegister, ...) live in lib/auth/hooks.ts: they
 * wrap these and also keep the token cookie in step.
 *
 *  POST /auth/register          register         RegisterDto
 *  POST /auth/login             login            LoginDto
 *  POST /auth/google            googleLogin      GoogleDto
 *  POST /auth/forgot-password   forgotPassword   ForgotPasswordDto
 *  POST /auth/reset-password    resetPassword    ResetPasswordDto
 *  POST /stores                 createStore      CreateStoreDto
 *  GET  /users/me               getAuthUser      the signed-in user (+ their store, if any)
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiSuccess<unknown>, RegisterRequest>({
      query: (body) => ({ url: API_ROUTES.auth.register, method: "POST", data: body }),
    }),

    login: builder.mutation<ApiSuccess<AuthPayload>, LoginRequest>({
      query: (body) => ({ url: API_ROUTES.auth.login, method: "POST", data: body }),
    }),

    googleLogin: builder.mutation<ApiSuccess<AuthPayload>, GoogleRequest>({
      query: (body) => ({ url: API_ROUTES.auth.google, method: "POST", data: body }),
    }),

    forgotPassword: builder.mutation<ApiSuccess<unknown>, ForgotPasswordRequest>({
      query: (body) => ({ url: API_ROUTES.auth.forgotPassword, method: "POST", data: body }),
    }),

    resetPassword: builder.mutation<ApiSuccess<unknown>, ResetPasswordRequest>({
      query: (body) => ({ url: API_ROUTES.auth.resetPassword, method: "POST", data: body }),
    }),

    /** Store setup, after a STORE_OWNER registers. Refreshes the user so `user.memberships` includes the new store. */
    createStore: builder.mutation<ApiSuccess<StoreSummary | null>, CreateStoreRequest>({
      query: (body) => ({ url: API_ROUTES.stores.create, method: "POST", data: body }),
      invalidatesTags: ["Auth"],
    }),

    getAuthUser: builder.query<ApiSuccess<User>, void>({
      query: () => ({ url: API_ROUTES.users.me, method: "GET" }),
      providesTags: ["Auth"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGoogleLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useCreateStoreMutation,
  useGetAuthUserQuery,
} = authApi;
