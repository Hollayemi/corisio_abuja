"use client";

import { monthLabel } from "./dates";

function ArrowButton({
  direction,
  onClick,
  label,
}: {
  direction: "left" | "right";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-full border border-neutral-800 text-neutral-900 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-corisio-blue"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        {direction === "left" ? (
          <path d="M19 12H5M11 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

export type DeliveryMonthNavProps = {
  /** Any date key in the visible month, e.g. "2026-09-01". */
  month: string;
  onPrevious: () => void;
  onNext: () => void;
};

/** ← September 2026 → */
export function DeliveryMonthNav({ month, onPrevious, onNext }: DeliveryMonthNavProps) {
  return (
    <div className="flex items-center gap-6 rounded-xl bg-neutral-100/70 px-4 py-3">
      <ArrowButton direction="left" onClick={onPrevious} label="Previous month" />
      <p aria-live="polite" className="min-w-36 text-center text-sm font-semibold text-neutral-900">
        {monthLabel(month)}
      </p>
      <ArrowButton direction="right" onClick={onNext} label="Next month" />
    </div>
  );
}
