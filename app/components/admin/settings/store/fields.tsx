"use client";

import type { ReactNode } from "react";
import type { DayKey, OpeningHours } from "@/redux/types";

export const inputClass =
  "h-14 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-corisio-blue focus:outline-none focus:ring-2 focus:ring-corisio-blue/20 disabled:bg-neutral-50 disabled:text-neutral-500";

export const textareaClass =
  "w-full resize-none rounded-xl border border-transparent bg-neutral-100 px-4 py-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-corisio-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-corisio-blue/20 disabled:text-neutral-500";

/** Label on the left, field on the right (same layout as the personal profile form). */
export function Row({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)] sm:gap-8">
      <label htmlFor={htmlFor} className="pt-0 text-base font-semibold text-neutral-900 sm:pt-4">
        {label}
      </label>
      <div className="max-w-[730px]">
        {children}
        {error ? (
          <p role="alert" className="mt-1.5 text-xs text-red-600">
            {error}
          </p>
        ) : (
          hint && <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>
        )}
      </div>
    </div>
  );
}

/** Heading inside a settings card. */
export function CardHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-b border-neutral-200 pb-5">
      <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
    </div>
  );
}

export function SaveBar({
  onSave,
  onDiscard,
  canSave,
  dirty,
  saving,
  error,
  saveLabel = "Save changes",
}: {
  onSave: () => void;
  onDiscard: () => void;
  canSave: boolean;
  dirty: boolean;
  saving: boolean;
  error?: string;
  saveLabel?: string;
}) {
  return (
    <div className="sm:grid sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)] sm:gap-8">
      <span aria-hidden="true" className="hidden sm:block" />
      <div className="max-w-[730px]">
        {error && (
          <p role="alert" className="mb-3 text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty || !canSave || saving}
            className="h-12 rounded-xl bg-corisio-500 px-6 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : saveLabel}
          </button>
          <button
            type="button"
            onClick={onDiscard}
            disabled={!dirty || saving}
            className="h-12 rounded-xl border border-neutral-300 px-6 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers shared by the store profile forms                           */
/* ------------------------------------------------------------------ */

export const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

const day = (closed = false, open = "08:00", close = "20:00") => ({ closed, open, close });

/** Used when a store has never set its hours. */
export const DEFAULT_HOURS: OpeningHours = {
  mon: day(),
  tue: day(),
  wed: day(),
  thu: day(),
  fri: day(),
  sat: day(),
  sun: day(true),
};

/** Adds https:// when someone types "mystore.com". Returns "" for an empty box, null if it can't be a link. */
export function normalizeUrl(value: string): string | null {
  const v = value.trim();
  if (!v) return "";
  const withProtocol = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const url = new URL(withProtocol);
    return url.hostname.includes(".") ? url.toString().replace(/\/$/, "") : null;
  } catch {
    return null;
  }
}

/** Digits with an optional leading +, 7 to 15 long. Loose on purpose: spaces and dashes are fine. */
export const isValidPhone = (value: string) => /^\+?\d{7,15}$/.test(value.replace(/[\s()-]/g, ""));

export const ORDER_PREFIX_PATTERN = /^[A-Z0-9]{2,6}$/;
