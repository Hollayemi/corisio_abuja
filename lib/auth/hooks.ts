"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useAppDispatch } from "@/redux/hooks";
import {
  authApi,
  useCreateStoreMutation,
  useForgotPasswordMutation,
  useGetAuthUserQuery,
  useGoogleLoginMutation,
  useLoginMutation,
  useRegisterMutation,
  useResetPasswordMutation,
} from "@/redux/slices/authApi";
import type {
  ApiError,
  AuthPayload,
  GoogleRequest,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/redux/types";
import { clearToken, readToken, subscribeToken, writeToken } from "./token";

/**
 * Auth hooks, built on the RTK Query endpoints in redux/slices/authApi.ts.
 *
 * The token cookie (see ./token.ts) says *whether* someone is signed in;
 * GET /users/me (cached by RTK Query) says *who*. Signing out just drops the
 * cookie: <AuthSync /> in redux/provider.tsx then clears every cached query.
 */

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

const noopSubscribe = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(noopSubscribe, () => true, () => false);
const useToken = () =>
  useSyncExternalStore(subscribeToken, readToken, () => null);

/**
 * Who is signed in.
 *
 *   const { user, status, isAuthenticated } = useAuth();
 *
 * `status` is "loading" until the browser has read the cookie (and, when
 * there is one, until /users/me answers), so first paint matches the server.
 */
export function useAuth() {
  const hydrated = useHydrated();
  const token = useToken();

  const query = useGetAuthUserQuery(undefined, { skip: !hydrated || !token });
  const user: User | null = token ? (query.data?.data ?? null) : null;

  let status: AuthStatus;
  if (!hydrated) status = "loading";
  else if (!token) status = "unauthenticated";
  else if (user) status = "authenticated";
  else if (query.isError) status = "unauthenticated";
  else status = "loading";

  return {
    user,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}

/** Re-read the user from the backend, e.g. after editing the profile. */
export function useRefreshUser() {
  const dispatch = useAppDispatch();
  return useCallback(
    () => dispatch(authApi.util.invalidateTags(["Auth"])),
    [dispatch],
  );
}

/** Returns a function that signs out. */
export function useLogout() {
  return useCallback(() => clearToken(), []);
}

/* ------------------------------------------------------------------ */
/* Sign in / register                                                  */
/* ------------------------------------------------------------------ */

/**
 * Stores the token, then loads the user from /users/me so everything
 * downstream (store setup redirect, dashboard access) works from the full
 * record, whatever slimmer user object the login endpoint returns.
 */
function useFinishSignIn() {
  const dispatch = useAppDispatch();

  return useCallback(
    async (payload: AuthPayload, remember: boolean): Promise<User> => {
      writeToken(payload.accessToken, remember);

      try {
        const res = await dispatch(
          authApi.endpoints.getAuthUser.initiate(undefined, { forceRefetch: true }),
        ).unwrap();
        return res.data;
      } catch {
        return payload.user;
      }
    },
    [dispatch],
  );
}

/**
 * LoginDto. Same shape as an RTK Query mutation hook:
 *
 *   const [login, { isLoading }] = useLogin();
 *   try { const user = await login({ email, password, rememberMe }); } catch (e) { getErrorMessage(e) }
 */
export function useLogin() {
  const [loginRequest, state] = useLoginMutation();
  const finish = useFinishSignIn();

  const login = useCallback(
    async (dto: LoginRequest): Promise<User> => {
      const res = await loginRequest(dto).unwrap();
      return finish(res.data, dto.rememberMe ?? true);
    },
    [loginRequest, finish],
  );

  return [login, { isLoading: state.isLoading }] as const;
}

/** GoogleDto: pass the ID token from Google Identity Services. Resolves with the user. */
export function useGoogleLogin() {
  const [googleRequest, state] = useGoogleLoginMutation();
  const finish = useFinishSignIn();

  const googleLogin = useCallback(
    async (dto: GoogleRequest): Promise<User> => {
      const res = await googleRequest(dto).unwrap();
      return finish(res.data, true);
    },
    [googleRequest, finish],
  );

  return [googleLogin, { isLoading: state.isLoading }] as const;
}

const SIGN_IN_AFTER_REGISTER_FAILED =
  "Your account was created, but we couldn't sign you in. Please log in.";

/** RegisterDto, then signs the new account straight in. Resolves with the user. */
export function useRegister() {
  const [registerRequest, registerState] = useRegisterMutation();
  const [loginRequest, loginState] = useLoginMutation();
  const finish = useFinishSignIn();

  const register = useCallback(
    async (dto: RegisterRequest): Promise<User> => {
      await registerRequest(dto).unwrap();

      let payload: AuthPayload;
      try {
        const res = await loginRequest({
          email: dto.email,
          password: dto.password,
          rememberMe: true,
        }).unwrap();
        payload = res.data;
      } catch {
        throw {
          status: 0,
          message: SIGN_IN_AFTER_REGISTER_FAILED,
          messages: [SIGN_IN_AFTER_REGISTER_FAILED],
        } satisfies ApiError;
      }

      return finish(payload, true);
    },
    [registerRequest, loginRequest, finish],
  );

  return [register, { isLoading: registerState.isLoading || loginState.isLoading }] as const;
}

/* ------------------------------------------------------------------ */
/* Plain RTK Query mutations, re-exported so pages import auth from one place */
/* ------------------------------------------------------------------ */

export {
  useCreateStoreMutation as useCreateStore,
  useForgotPasswordMutation as useForgotPassword,
  useResetPasswordMutation as useResetPassword,
};

