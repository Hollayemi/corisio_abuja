"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import { CloseIcon } from "@/app/components/ui/icons";
import {
  useForgotPassword,
  useGoogleLogin,
  useLogin,
  useRegister,
} from "@/lib/auth/hooks";
import { postAuthPath } from "@/lib/auth/staff";
import {
  isValidEmail,
  isValidName,
  isValidPassword,
  PASSWORD_HINT,
} from "@/lib/auth/validation";
import { getErrorMessage } from "@/redux/config/errors";
import { SignupAccountType, type User } from "@/redux/types";
import {
  AccountTypePicker,
  ErrorText,
  OrDivider,
  PasswordField,
  SubmitButton,
  SwitchPrompt,
  TextField,
} from "./AuthFields";
import GoogleSignIn from "./GoogleSignIn";
import { siteConfig } from "@/app/config/site";

export type AuthView = "login" | "register" | "forgot" | "welcome";

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

export default function AuthDialog({
  initialView = "login",
  initialAccountType = SignupAccountType.CUSTOMER,
  notice,
}: {
  initialView?: AuthView;
  /** Which "I'm signing up as" option starts selected on the register form. */
  initialAccountType?: SignupAccountType;
  /** Why the dialog opened, shown above the login form. */
  notice?: string;
}) {
  const { closeDialog } = useDialog();
  const router = useRouter();
  const [view, setView] = useState<AuthView>(initialView);
  const [welcomeName, setWelcomeName] = useState("");

  /**
   * Someone just signed in or registered. A store owner who hasn't set up
   * their store yet goes to the store setup page; everyone else stays put.
   * Returns true when it navigated away.
   */
  function leaveForSetup(user: User) {
    const next = postAuthPath(user);
    if (!next) return false;
    closeDialog();
    router.push(next);
    return true;
  }

  return (
    <div className="relative flex h-full flex-col overflow-y-auto px-8 pb-10 pt-10">
      <button
        type="button"
        onClick={closeDialog}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-md p-1.5 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
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

      {view === "login" && notice && (
        <p
          role="status"
          className="mt-6 rounded-lg bg-[#fdf3e3] px-4 py-3 text-center text-sm text-neutral-800"
        >
          {notice}
        </p>
      )}

      {view === "login" && (
        <LoginForm
          onSwitch={setView}
          onSignedIn={(user) => {
            if (!leaveForSetup(user)) closeDialog();
          }}
        />
      )}

      {view === "register" && (
        <RegisterForm
          initialAccountType={initialAccountType}
          onSwitch={setView}
          onRegistered={(user) => {
            if (leaveForSetup(user)) return;
            setWelcomeName(user.name);
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
  accountType,
  onSignedIn,
  onError,
}: {
  disabled: boolean;
  /** Only sent on the register form (GoogleDto.accountType); sign in leaves it out. */
  accountType?: SignupAccountType;
  onSignedIn: (user: User) => void;
  onError: (message: string) => void;
}) {
  const [googleLogin, { isLoading }] = useGoogleLogin();

  async function handleCredential(idToken: string) {
    try {
      onSignedIn(await googleLogin({ idToken, accountType }));
    } catch (err) {
      onError(getErrorMessage(err));
    }
  }

  return (
    <>
      <OrDivider />
      <GoogleSignIn
        onCredential={handleCredential}
        onError={onError}
        disabled={disabled || isLoading}
        text={accountType ? "signup_with" : "continue_with"}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Sign in                                                             */
/* ------------------------------------------------------------------ */

function LoginForm({
  onSwitch,
  onSignedIn,
}: {
  onSwitch: (view: AuthView) => void;
  onSignedIn: (user: User) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [login, { isLoading }] = useLogin();

  const valid = isValidEmail(email) && password.length > 0;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid || isLoading) return;

    setError("");
    try {
      onSignedIn(await login({ email: email.trim(), password, rememberMe: true }));
    } catch (err) {
      setError(getErrorMessage(err));
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

        <SubmitButton
          disabled={!valid}
          loading={isLoading}
          loadingText="Signing in..."
        >
          Sign In
        </SubmitButton>
      </form>

      <button
        type="button"
        onClick={() => onSwitch("forgot")}
        className="mx-auto mt-5 text-xs font-medium text-corisio-blue hover:underline focus-visible:outline-2 focus-visible:outline-corisio-blue"
      >
        Forget Password
      </button>

      <div className="mt-5 space-y-5">
        <GoogleSection
          disabled={isLoading}
          onSignedIn={onSignedIn}
          onError={setError}
        />
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
  initialAccountType,
  onSwitch,
  onRegistered,
}: {
  initialAccountType: SignupAccountType;
  onSwitch: (view: AuthView) => void;
  onRegistered: (user: User) => void;
}) {
  const [accountType, setAccountType] =
    useState<SignupAccountType>(initialAccountType);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [register, { isLoading }] = useRegister();

  const isStoreOwner = accountType === SignupAccountType.STORE_OWNER;
  const valid =
    isValidName(name) && isValidEmail(email) && isValidPassword(password);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid || isLoading) return;

    setError("");
    try {
      onRegistered(
        await register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
          accountType,
        }),
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <Heading
        title="Create your account"
        subtitle={
          isStoreOwner
            ? "Create your account first, then set up your store profile."
            : "Save your details, track your orders and make your next shop even easier."
        }
      />

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <AccountTypePicker value={accountType} onChange={setAccountType} />

        <TextField
          label={isStoreOwner ? "Your Full Name" : "Full Name"}
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

        <TextField
          label="Phone Number (optional)"
          type="tel"
          name="phone"
          autoComplete="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError("");
          }}
          placeholder="Enter your phone number"
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
          hint={PASSWORD_HINT}
        />

        {error && <ErrorText>{error}</ErrorText>}

        <SubmitButton
          disabled={!valid}
          loading={isLoading}
          loadingText="Creating account..."
        >
          {isStoreOwner ? "Create Account & Set Up Store" : "Create Account"}
        </SubmitButton>
      </form>

      <div className="mt-5 space-y-5">
        <GoogleSection
          disabled={isLoading}
          accountType={accountType}
          onSignedIn={onRegistered}
          onError={setError}
        />
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
  const [sentTo, setSentTo] = useState("");

  const [forgotPassword, { isLoading }] = useForgotPassword();

  const valid = isValidEmail(email);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid || isLoading) return;

    setError("");
    try {
      await forgotPassword({ email: email.trim() }).unwrap();
      setSentTo(email.trim());
    } catch (err) {
      setError(getErrorMessage(err));
    }
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
          className="mt-9 rounded-lg bg-[#e6f3e4] px-4 py-4 text-sm leading-relaxed text-corisio-blue"
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
            loading={isLoading}
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
        className="mt-8 inline-flex h-[52px] w-full items-center justify-center rounded-lg bg-corisio-blue text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
      >
        Start Shopping
      </Link>
    </div>
  );
}
