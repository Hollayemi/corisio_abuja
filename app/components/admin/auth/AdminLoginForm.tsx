"use client";

import { getSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import useOpenAuth from "@/app/components/auth/useOpenAuth";
import {
  ErrorText,
  GoogleButton,
  OrDivider,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/app/components/auth/AuthFields";
import { notify } from "@/lib/notify";
import { firstName, isStaffRole, NO_ADMIN_ACCESS } from "@/lib/auth/staff";
import { isValidEmail } from "@/lib/auth/validation";
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const valid = isValidEmail(email) && password.length > 0;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid || loading) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        remember: String(remember),
        type: "admin",
        redirect: false,
      });

      if (result?.error) {
        setError("Incorrect email or password.");
        setLoading(false);
        return;
      }

      // Customers share this sign in, so make sure this is a staff account
      const session = await getSession();
      if (!isStaffRole(session?.user?.role)) {
        await signOut({ redirect: false });
        setError(NO_ADMIN_ACCESS);
        setLoading(false);
        return;
      }

      notify.success(`Welcome, ${firstName(session?.user?.name)}`, {
        message: "You're signed in. Taking you to your dashboard.",
      });
      router.replace(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError("");
    try {
      // Full-page redirect to Google; /admin checks the account is staff
      await signIn("google", { callbackUrl });
    } catch {
      setError("We couldn't reach Google. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <GoogleButton onClick={handleGoogle} disabled={loading} />

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
