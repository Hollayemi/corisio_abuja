"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import useOpenAuth from "@/app/components/auth/useOpenAuth";
import {
  ErrorText,
  OrDivider,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/app/components/auth/AuthFields";
import GoogleSignIn from "@/app/components/auth/GoogleSignIn";
import { useGoogleLogin, useLogin, useLogout } from "@/lib/auth/hooks";
import { notify } from "@/lib/notify";
import {
  canAccessDashboard,
  firstName,
  NO_DASHBOARD_ACCESS,
  postAuthPath,
} from "@/lib/auth/staff";
import { isValidEmail } from "@/lib/auth/validation";
import { getErrorMessage } from "@/redux/config/errors";
import type { User } from "@/redux/types";
import { CheckboxField } from "./AdminAuthFields";

export default function AdminLoginForm({
  callbackUrl,
  initialError = "",
}: {
  /** Where to go after signing in (already checked to be inside /admin) */
  callbackUrl: string;
  initialError?: string;
}) {
  const router = useRouter();
  const openAuth = useOpenAuth();

  const [login, { isLoading: loggingIn }] = useLogin();
  const [googleLogin, { isLoading: googleLoggingIn }] = useGoogleLogin();
  const logout = useLogout();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(initialError);

  const loading = loggingIn || googleLoggingIn;
  const valid = isValidEmail(email) && password.length > 0;

  /** Runs after either sign in method succeeds. */
  function handleSignedIn(user: User) {
    // A store owner who hasn't set up their store yet finishes that first
    const setup = postAuthPath(user);
    if (setup) {
      router.replace(setup);
      return;
    }

    // Customers share this sign in, so make sure this account may open the dashboard
    if (!canAccessDashboard(user)) {
      logout();
      setError(NO_DASHBOARD_ACCESS);
      return;
    }

    notify.success(`Welcome, ${firstName(user.name)}`, {
      message: "You're signed in. Taking you to your dashboard.",
    });
    router.replace(callbackUrl);
    router.refresh();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid || loading) return;

    setError("");
    try {
      handleSignedIn(await login({ email: email.trim(), password, rememberMe: remember }));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleGoogle(idToken: string) {
    setError("");
    try {
      handleSignedIn(await googleLogin({ idToken }));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <GoogleSignIn onCredential={handleGoogle} onError={setError} disabled={loading} />

      <div className="my-6">
        <OrDivider />
      </div>

      <form method="post" onSubmit={handleSubmit} noValidate className="space-y-5">
        <TextField
          label="Email Address"
          type="email"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          placeholder="Enter your email address"
        />

        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          placeholder="Enter password"
        />

        <div className="flex items-center justify-between">
          <CheckboxField
            label="Keep me signed in"
            name="remember"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <button
            type="button"
            onClick={() => openAuth("forgot")}
            className="text-xs font-medium text-corisio-blue hover:underline focus-visible:outline-2 focus-visible:outline-corisio-blue"
          >
            Forget Password
          </button>
        </div>

        {error && <ErrorText>{error}</ErrorText>}

        <SubmitButton disabled={!valid} loading={loading} loadingText="Signing in...">
          Sign In
        </SubmitButton>
      </form>
    </>
  );
}
