"use client";

import {
  useId,
  useState,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from "react";
import { SignupAccountType } from "@/redux/types";

const inputClass =
  "h-[52px] w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-corisio-blue focus:outline-none focus:ring-2 focus:ring-corisio-blue/30";

const labelClass = "text-sm font-medium text-neutral-900";

type FieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "id" | "type"
> & {
  label: string;
  /** Small helper text under the field */
  hint?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Fields                                                              */
/* ------------------------------------------------------------------ */

export function TextField({ label, hint, ...props }: FieldProps & { type?: string }) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        aria-describedby={hint ? hintId : undefined}
        className={`${inputClass} mt-2.5`}
        {...props}
      />
      {hint && (
        <p id={hintId} className="mt-2 text-xs text-neutral-500">
          {hint}
        </p>
      )}
    </div>
  );
}

export function TextAreaField({
  label,
  hint,
  ...props
}: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "id"> & {
  label: string;
  hint?: string;
}) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <textarea
        id={id}
        rows={4}
        aria-describedby={hint ? hintId : undefined}
        className={`${inputClass} mt-2.5 h-auto resize-y py-3`}
        {...props}
      />
      {hint && (
        <p id={hintId} className="mt-2 text-xs text-neutral-500">
          {hint}
        </p>
      )}
    </div>
  );
}

export function PasswordField({ label, hint, ...props }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>

      <div className="relative mt-2.5">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-describedby={hint ? hintId : undefined}
          className={`${inputClass} pr-12`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1.5 text-neutral-500 transition hover:text-neutral-800 focus-visible:outline-2 focus-visible:outline-corisio-blue"
        >
          {visible ? (
            <EyeOffIcon className="size-5" />
          ) : (
            <EyeIcon className="size-5" />
          )}
        </button>
      </div>

      {hint && (
        <p id={hintId} className="mt-2 text-xs text-neutral-500">
          {hint}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons and small pieces                                            */
/* ------------------------------------------------------------------ */

export function SubmitButton({
  disabled,
  loading,
  loadingText,
  children,
}: {
  /** Grey and inactive while the form isn't valid yet */
  disabled: boolean;
  loading: boolean;
  loadingText: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={`inline-flex h-[52px] w-full items-center justify-center rounded-lg text-sm font-medium text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue ${
        disabled
          ? "cursor-not-allowed bg-[#bdbcb8]"
          : "bg-corisio-blue hover:brightness-110"
      } ${loading ? "cursor-wait opacity-70" : ""}`}
    >
      {loading ? loadingText : children}
    </button>
  );
}

export function GoogleButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-[52px] w-full items-center justify-center gap-3 rounded-lg border border-neutral-300 bg-white text-sm font-medium text-neutral-900 transition hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue disabled:cursor-not-allowed disabled:opacity-60"
    >
      <GoogleIcon className="size-5" />
      Continue with Google
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-4 text-xs text-neutral-600">
      <span aria-hidden="true" className="h-px flex-1 bg-neutral-200" />
      Or
      <span aria-hidden="true" className="h-px flex-1 bg-neutral-200" />
    </div>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-sm text-red-600">
      {children}
    </p>
  );
}

export function SwitchPrompt({
  text,
  action,
  onClick,
}: {
  text: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <p className="text-center text-xs text-neutral-800">
      {text}{" "}
      <button
        type="button"
        onClick={onClick}
        className="font-medium text-corisio-blue hover:underline focus-visible:outline-2 focus-visible:outline-corisio-blue"
      >
        {action}
      </button>
    </p>
  );
}


/* ------------------------------------------------------------------ */
/* Account type                                                        */
/* ------------------------------------------------------------------ */

const ACCOUNT_TYPES: { value: SignupAccountType; title: string; text: string }[] = [
  {
    value: SignupAccountType.CUSTOMER,
    title: "I want to shop",
    text: "Discover stores and order from them",
  },
  {
    value: SignupAccountType.STORE_OWNER,
    title: "I own a store",
    text: "List your store and sell on Corisio",
  },
];

/** Customer / store owner choice for the register form (RegisterDto.accountType). */
export function AccountTypePicker({
  value,
  onChange,
}: {
  value: SignupAccountType;
  onChange: (value: SignupAccountType) => void;
}) {
  return (
    <fieldset>
      <legend className={labelClass}>I&rsquo;m signing up as</legend>
      <div className="mt-2.5 grid grid-cols-2 gap-3">
        {ACCOUNT_TYPES.map((type) => {
          const selected = value === type.value;
          return (
            <label
              key={type.value}
              className={`cursor-pointer rounded-lg border p-3 text-left transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-corisio-blue ${
                selected
                  ? "border-corisio-blue bg-corisio-blue/5"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <input
                type="radio"
                name="accountType"
                value={type.value}
                checked={selected}
                onChange={() => onChange(type.value)}
                className="sr-only"
              />
              <span className="block text-sm font-semibold text-neutral-900">
                {type.title}
              </span>
              <span className="mt-1 block text-xs leading-snug text-neutral-600">
                {type.text}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
