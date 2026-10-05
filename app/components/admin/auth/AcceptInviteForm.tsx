"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ErrorText,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/app/components/auth/AuthFields";
import { useLogin, useLogout } from "@/lib/auth/hooks";
import { notify } from "@/lib/notify";
import {
  DASHBOARD_AUTH_PATH,
  DASHBOARD_PATH,
  firstName,
  formatRole,
  isStaffRole,
  withArticle,
} from "@/lib/auth/staff";
import { isValidName, isValidPassword, PASSWORD_HINT } from "@/lib/auth/validation";
import { getErrorMessage, isApiError } from "@/redux/config/errors";
import {
  useAcceptInviteMutation,
  useVerifyInviteQuery,
} from "@/redux/slices/adminAuthApi";
import AdminAuthShell from "./AdminAuthShell";
import { LockedField } from "./AdminAuthFields";

const PILL = "Sign up to Luxol";

/**
 * /dashboard/auth/invite?token=...  (the link in the invitation email)
 *
 * 1. checks the token with the backend, which says which email and role it is for
 * 2. the invited person fills in their name and a password
 * 3. the account is created, they're signed in and land on the dashboard
 */
export default function AcceptInviteForm({ token }: { token: string }) {
  const { data, error, isLoading, refetch } = useVerifyInviteQuery(token, {
    skip: !token,
  });
  const invite = data?.data;

  if (invite) {
    return (
      <AdminAuthShell
        pill={PILL}
        title="Welcome to the Team!"
        description={`You've been invited by the admin to join as ${withArticle(formatRole(invite.role))}, so kindly provide your information to create an account.`}
      >
        <SetupForm token={token} email={invite.email} />
      </AdminAuthShell>
    );
  }

  // Couldn't reach the server (as opposed to "this link is bad")
  const couldntCheck =
    !!token &&
    !isLoading &&
    isApiError(error) &&
    (error.status === 0 || error.status >= 500);

  if (isLoading) {
    return (
      <AdminAuthShell
        pill={PILL}
        title="Welcome to the Team!"
        description="You've been invited by the admin to join the Luxol team, so kindly provide your information to create an account."
      >
        <div aria-busy="true" aria-label="Checking your invitation" className="space-y-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[52px] animate-pulse rounded-lg bg-neutral-100" />
          ))}
        </div>
      </AdminAuthShell>
    );
  }

  return (
    <AdminAuthShell
      pill={PILL}
      title={couldntCheck ? "Something went wrong." : "This invite isn't valid."}
      description={
        couldntCheck
          ? "We couldn't check your invitation just now."
          : "The link may have expired or already been used. Ask the admin to send you a new invitation."
      }
    >
      <div role="alert" className="space-y-5 text-center">
        <p className="text-sm text-neutral-600">
          {couldntCheck
            ? getErrorMessage(error)
            : "We couldn't find an active invitation for this link."}
        </p>
        {couldntCheck ? (
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex h-[52px] w-full items-center justify-center rounded-lg bg-corisio-blue text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
          >
            Try again
          </button>
        ) : (
          <Link
            href={DASHBOARD_AUTH_PATH}
            className="inline-flex h-[52px] w-full items-center justify-center rounded-lg border border-neutral-300 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
          >
            Go to sign in
          </Link>
        )}
      </div>
    </AdminAuthShell>
  );
}

function SetupForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [acceptInvite] = useAcceptInviteMutation();
  const [login] = useLogin();
  const logout = useLogout();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const mismatch = confirm.length > 0 && confirm !== password;
  const valid =
    isValidName(name) && isValidPassword(password) && confirm === password;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid || loading) return;

    setLoading(true);
    setError("");

    try {
      await acceptInvite({ token, name: name.trim(), password }).unwrap();
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
      return;
    }

    // Account exists now. Sign them straight in.
    try {
      const user = await login({ email, password, rememberMe: true });

      if (isStaffRole(user.role)) {
        notify.success(`Welcome, ${firstName(name)}`, {
          message: "Your account is ready. Taking you to your dashboard.",
        });
        router.replace(DASHBOARD_PATH);
        router.refresh();
        return;
      }

      logout();
    } catch {
      // fall through to the sign in page below
    }

    notify.success("Account created", {
      message: "Sign in with your new password to continue.",
    });
    router.replace(DASHBOARD_AUTH_PATH);
  }

  return (
    <form method="post" onSubmit={handleSubmit} noValidate className="space-y-5">
      <LockedField label="Email Address" name="email" value={email} />

      <TextField
        label="Full Name"
        name="name"
        autoComplete="name"
        autoFocus
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError("");
        }}
        placeholder="Enter your full name"
      />

      <PasswordField
        label="Password"
        name="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setError("");
        }}
        placeholder="Enter password"
        hint={PASSWORD_HINT}
      />

      <div>
        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            setError("");
          }}
          placeholder="Re-enter password"
          aria-invalid={mismatch}
        />
        {mismatch && (
          <p role="alert" className="mt-2 text-xs text-red-600">
            Passwords don&rsquo;t match.
          </p>
        )}
      </div>

      {error && <ErrorText>{error}</ErrorText>}

      <div className="pt-3">
        <SubmitButton
          disabled={!valid}
          loading={loading}
          loadingText="Setting up your account..."
        >
          Complete Account Setup &amp; Log In
        </SubmitButton>
      </div>
    </form>
  );
}
