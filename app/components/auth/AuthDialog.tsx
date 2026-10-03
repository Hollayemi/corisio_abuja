"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import { CloseIcon } from "@/app/components/ui/icons";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useForgotPasswordMutation,
  useRegisterMutation,
} from "@/redux/slices/authApi";
import {
  isValidEmail,
  isValidName,
  isValidPassword,
  MIN_PASSWORD_LENGTH,
} from "@/lib/auth/validation";
import {
  ErrorText,
  GoogleButton,
  OrDivider,
  PasswordField,
  SubmitButton,
  SwitchPrompt,
  TextField,
} from "./AuthFields";
import { siteConfig } from "@/app/config/site";

export type AuthView = "login" | "register" | "forgot" | "welcome";

const NETWORK_ERROR = "Something went wrong. Please try again.";

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

export default function AuthDialog({
  initialView = "login",
}: {
  initialView?: AuthView;
}) {
  const { closeDialog } = useDialog();
  const [view, setView] = useState<AuthView>(initialView);
  const [welcomeName, setWelcomeName] = useState("");

  return (
    <div className="relative flex h-full flex-col overflow-y-auto px-8 pb-10 pt-10">
      <button
        type="button"
        onClick={closeDialog}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-md p-1.5 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxol-green"
      >
        <CloseIcon className="size-5" />
      </button>

      {view !== "welcome" && (
        <Image
          src={siteConfig.logo}
          alt={siteConfig.name}
          width={120}
          height={64}
          className="mx-auto h-16 w-auto"
        />
      )}

      {view === "login" && (
        <LoginForm onSwitch={setView} onDone={closeDialog} />
      )}

      {view === "register" && (
        <RegisterForm
          onSwitch={setView}
          onRegistered={(name) => {
            setWelcomeName(name);
            setView("welcome");
          }}
        />
      )}

      {view === "forgot" && <ForgotForm onSwitch={setView} />}

      {view === "welcome" && (
        <Welcome name={welcomeName} onDone={closeDialog} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mt-14 text-center">
      <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
      <p className="mx-auto mt-3 max-w-[300px] text-sm leading-relaxed text-neutral-600">
        {subtitle}
      </p>
    </div>
  );
}

function GoogleSection({
  disabled,
  onError,
}: {
  disabled: boolean;
  onError: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      // Full-page redirect to Google, then back to the page you were on
      await signIn("google", { callbackUrl: window.location.href });
    } catch {
      onError("We couldn't reach Google. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <OrDivider />
      <GoogleButton onClick={handleClick} disabled={disabled || loading} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Sign in                                                             */
/* ------------------------------------------------------------------ */

function LoginForm({
  onSwitch,
  onDone,
}: {
  onSwitch: (view: AuthView) => void;
  onDone: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
        redirect: false,
      });

      if (result?.error) {
        setError("Incorrect email or password.");
        setLoading(false);
        return;
      }

      onDone();
    } catch {
      setError(NETWORK_ERROR);
      setLoading(false);
    }
  }

  return (
    <>
      <Heading
        title="Sign In"
        subtitle="Sign in to access your orders, saved details and account."
      />

      <form onSubmit={handleSubmit} noValidate className="mt-9 space-y-5">
        <TextField
          label="Enter Email Address"
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
          placeholder="Enter your password"
        />

        {error && <ErrorText>{error}</ErrorText>}

        <SubmitButton disabled={!valid} loading={loading} loadingText="Signing in...">
          Sign In
        </SubmitButton>
      </form>

      <button
        type="button"
        onClick={() => onSwitch("forgot")}
        className="mx-auto mt-5 text-xs font-medium text-luxol-green hover:underline focus-visible:outline-2 focus-visible:outline-luxol-green"
      >
        Forget Password
      </button>

      <div className="mt-5 space-y-5">
        <GoogleSection disabled={loading} onError={setError} />
        <SwitchPrompt
          text="Don't have an account?"
          action="Register"
          onClick={() => onSwitch("register")}
        />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Create account                                                      */
/* ------------------------------------------------------------------ */

function RegisterForm({
  onSwitch,
  onRegistered,
}: {
  onSwitch: (view: AuthView) => void;
  onRegistered: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [registerUser] = useRegisterMutation();

  const valid =
    isValidName(name) && isValidEmail(email) && isValidPassword(password);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid || loading) return;

    setLoading(true);
    setError("");

    try {
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      }).unwrap();
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
      return;
    }

    try {
      const signedIn = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (signedIn?.error) {
        setError("Your account was created, but we couldn't sign you in. Please log in.");
        setLoading(false);
        return;
      }

      onRegistered(name.trim());
    } catch {
      setError(NETWORK_ERROR);
      setLoading(false);
    }
  }

  return (
    <>
      <Heading
        title="Create your account"
        subtitle="Save your details, track your orders and make your next shop even easier."
      />

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
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

        <TextField
          label="Email Address"
          type="email"
          name="email"
          autoComplete="email"
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          placeholder="Enter your password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters`}
        />

        {error && <ErrorText>{error}</ErrorText>}

        <SubmitButton
          disabled={!valid}
          loading={loading}
          loadingText="Creating account..."
        >
          Create Account
        </SubmitButton>
      </form>

      <div className="mt-5 space-y-5">
        <GoogleSection disabled={loading} onError={setError} />
        <SwitchPrompt
          text="Already have an account?"
          action="Log In"
          onClick={() => onSwitch("login")}
        />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Forgot password                                                     */
/* ------------------------------------------------------------------ */

function ForgotForm({ onSwitch }: { onSwitch: (view: AuthView) => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const [forgotPassword] = useForgotPasswordMutation();

  const valid = isValidEmail(email);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid || loading) return;

    setLoading(true);
    setError("");

    try {
      await forgotPassword({ email: email.trim() }).unwrap();
      setSentTo(email.trim());
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setLoading(false);
  }

  return (
    <>
      <Heading
        title="Forgot Password"
        subtitle="Enter the email address linked to your Luxol account and we'll send you a link to reset your password."
      />

      {sentTo ? (
        <p
          role="status"
          className="mt-9 rounded-lg bg-[#e6f3e4] px-4 py-4 text-sm leading-relaxed text-luxol-green"
        >
          If an account exists for <span className="font-semibold">{sentTo}</span>,
          we&rsquo;ve sent a link to reset your password. Check your inbox.
        </p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-9 space-y-5">
          <TextField
            label="Enter Email Address"
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

          {error && <ErrorText>{error}</ErrorText>}

          <SubmitButton
            disabled={!valid}
            loading={loading}
            loadingText="Sending..."
          >
            Send Reset Link
          </SubmitButton>
        </form>
      )}

      <div className="mt-5">
        <SwitchPrompt
          text="Remember your password?"
          action="Back to sign in"
          onClick={() => onSwitch("login")}
        />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Welcome                                                             */
/* ------------------------------------------------------------------ */

function Welcome({ name, onDone }: { name: string; onDone: () => void }) {
  const firstName = name.trim().split(/\s+/)[0] || "there";

  return (
    <div
      role="status"
      className="flex flex-1 flex-col items-center justify-center pb-16 text-center"
    >
      <svg viewBox="0 0 80 80" aria-hidden="true" className="size-16">
        <defs>
          <linearGradient id="welcome-ok" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4fb04a" />
            <stop offset="1" stopColor="#86d97a" />
          </linearGradient>
        </defs>
        <rect width="80" height="80" rx="22" fill="url(#welcome-ok)" />
        <path
          d="M24 41l11 11 21-23"
          fill="none"
          stroke="#fff"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <h2 className="mt-8 text-xl font-bold text-neutral-900">
        Welcome to Luxol, {firstName} <span aria-hidden="true">👋</span>
      </h2>
      <p className="mt-3 max-w-[300px] text-sm leading-relaxed text-neutral-600">
        Your account is ready. Start shopping for quality food and groceries,
        or explore what Luxol has to offer.
      </p>

      <Link
        href="/shop"
        onClick={onDone}
        className="mt-8 inline-flex h-[52px] w-full items-center justify-center rounded-lg bg-luxol-green text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxol-green"
      >
        Start Shopping
      </Link>
    </div>
  );
}
