"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { getInitials } from "@/app/components/admin/orders/formatters";

/* ------------------------------------------------------------------ */
/* Avatar                                                              */
/* ------------------------------------------------------------------ */

export type AvatarProps = {
  name: string;
  src?: string | null;
  className?: string;
};

/** Round photo, or initials when there isn't one. */
export function Avatar({ name, src, className = "size-10" }: AvatarProps) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#dcefd6] text-xs font-semibold text-corisio-blue ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Switches                                                            */
/* ------------------------------------------------------------------ */

export type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible name: "Two-Factor Authentication". */
  label: string;
  disabled?: boolean;
};

/** The big on/off switch (Two-Factor Authentication, Quiet Hours). */
export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-lg p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? "bg-[#1e5314]" : "bg-[#dedcd8]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`block h-6 w-7 rounded-md bg-white shadow-sm transition-transform motion-reduce:transition-none ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export type CheckToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible name: "New orders by email". */
  label: string;
};

/** The ✓ / ✕ square for one channel of a notification. */
export function CheckToggle({ checked, onChange, label }: CheckToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`flex h-9 w-[52px] items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue ${
        checked ? "bg-[#1e5314] text-white" : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        {checked ? (
          <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Password field                                                      */
/* ------------------------------------------------------------------ */

export type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  error?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "autoComplete" | "id" | "className">;

/** Bordered password input with the eye button to show what you typed. */
export function PasswordField({ label, value, onChange, autoComplete, error, ...props }: PasswordFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-neutral-900">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          placeholder="Enter password"
          aria-invalid={!!error}
          onChange={(e) => onChange(e.target.value)}
          className={`h-12 w-full rounded-xl border bg-white pl-4 pr-12 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
            error
              ? "border-red-400 focus:ring-red-500/20"
              : "border-neutral-200 focus:border-corisio-blue focus:ring-corisio-blue/20"
          }`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-neutral-500 transition hover:text-neutral-800"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
            {visible && <path d="M4 20L20 4" strokeLinecap="round" />}
          </svg>
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section states                                                      */
/* ------------------------------------------------------------------ */

export function SectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-hidden="true" className="space-y-4 rounded-3xl border border-neutral-100 bg-white p-8">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-xl bg-neutral-100" />
      ))}
    </div>
  );
}

export function SectionError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-3xl border border-neutral-100 bg-white px-6 py-16 text-center"
    >
      <p className="text-sm text-neutral-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
      >
        Try again
      </button>
    </div>
  );
}

/** A white rounded card used by every settings section. */
export function SettingsCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border border-neutral-100 bg-white ${className}`}>{children}</section>
  );
}
