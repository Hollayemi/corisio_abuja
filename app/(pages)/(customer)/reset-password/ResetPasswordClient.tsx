"use client";

import { useState, type FormEvent } from "react";
import {
  ErrorText,
  PasswordField,
  SubmitButton,
} from "@/app/components/auth/AuthFields";
import useOpenAuth from "@/app/components/auth/useOpenAuth";
import { useResetPassword } from "@/lib/auth/hooks";
import { isValidPassword, PASSWORD_HINT } from "@/lib/auth/validation";
import { getErrorMessage } from "@/redux/config/errors";

const container = "mx-auto w-full max-w-[460px] px-4 py-12 sm:px-6";

export default function ResetPasswordClient({ token }: { token: string }) {
  const openAuth = useOpenAuth();
  const [resetPassword, { isLoading }] = useResetPassword();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const mismatch = confirmPassword.length > 0 && confirmPassword !== password;
  const valid = isValidPassword(password) && confirmPassword === password;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid || isLoading) return;

    setError("");
    try {
      await resetPassword({ token, password, confirmPassword }).unwrap();
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (!token) {
    return (
      <div className={`${container} text-center`}>
        <h1 className="text-2xl font-bold text-neutral-900">This link isn&rsquo;t valid</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          The reset link is missing or incomplete. Request a new one and use the link in the latest
          email.
        </p>
        <button
          type="button"
          onClick={() => openAuth("forgot")}
          className="mt-8 inline-flex h-[52px] w-full items-center justify-center rounded-lg bg-corisio-blue text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
        >
          Request a new link
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className={`${container} text-center`} role="status">
        <h1 className="text-2xl font-bold text-neutral-900">Password updated</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          Your password has been changed. Sign in with your new password to continue.
        </p>
        <button
          type="button"
          onClick={() => openAuth("login")}
          className="mt-8 inline-flex h-[52px] w-full items-center justify-center rounded-lg bg-corisio-blue text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className={container}>
      <h1 className="text-center text-2xl font-bold text-neutral-900">Choose a new password</h1>
      <p className="mt-3 text-center text-sm leading-relaxed text-neutral-600">
        Pick something you haven&rsquo;t used on Corisio before.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-9 space-y-5">
        <PasswordField
          label="New Password"
          name="password"
          autoComplete="new-password"
          autoFocus
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          placeholder="Enter a new password"
          hint={PASSWORD_HINT}
        />

        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError("");
          }}
          placeholder="Re-enter the new password"
          hint={mismatch ? "The passwords don't match" : undefined}
        />

        {error && <ErrorText>{error}</ErrorText>}

        <SubmitButton
          disabled={!valid}
          loading={isLoading}
          loadingText="Updating..."
        >
          Update Password
        </SubmitButton>
      </form>
    </div>
  );
}
