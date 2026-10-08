"use client";

import type { DayKey, OpeningDay, OpeningHours } from "@/redux/types";
import { DAYS } from "./fields";

const timeClass =
  "h-10 w-full rounded-lg border border-neutral-300 bg-white px-2.5 text-sm text-neutral-900 tabular-nums focus:border-corisio-blue focus:outline-none focus:ring-4 focus:ring-corisio-blue/10 disabled:bg-neutral-50 disabled:text-neutral-400";

export function hoursErrors(hours: OpeningHours): Partial<Record<DayKey, string>> {
  const errors: Partial<Record<DayKey, string>> = {};
  for (const { key } of DAYS) {
    const d = hours[key];
    if (d.closed) continue;
    if (!d.open || !d.close) errors[key] = "Set both times.";
    else if (d.open >= d.close) errors[key] = "Closing time must be after opening time.";
  }
  return errors;
}

export function OpeningHoursEditor({
  value,
  onChange,
  disabled,
}: {
  value: OpeningHours;
  onChange: (next: OpeningHours) => void;
  disabled?: boolean;
}) {
  const errors = hoursErrors(value);

  function update(key: DayKey, patch: Partial<OpeningDay>) {
    onChange({ ...value, [key]: { ...value[key], ...patch } });
  }

  function copyMondayToAll() {
    const monday = value.mon;
    onChange(Object.fromEntries(DAYS.map(({ key }) => [key, { ...monday }])) as OpeningHours);
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      <ul className="divide-y divide-neutral-100">
        {DAYS.map(({ key, label }) => {
          const d = value[key];
          const err = errors[key];
          return (
            <li key={key} className="px-4 py-3 sm:px-5">
              {/* Mobile: stacked. Desktop: single row */}
              <div className="grid gap-2 sm:grid-cols-[130px_120px_1fr_1fr] sm:items-center sm:gap-4">
                {/* Day + toggle */}
                <div className="flex items-center justify-between sm:justify-start sm:gap-3">
                  <span className="text-sm font-semibold text-neutral-900">{label}</span>
                  <label className="flex items-center gap-2 text-xs text-neutral-600 sm:hidden">
                    <input
                      type="checkbox"
                      checked={!d.closed}
                      disabled={disabled}
                      onChange={(e) => update(key, { closed: !e.target.checked })}
                      className="size-4 accent-corisio-blue"
                    />
                    {d.closed ? "Closed" : "Open"}
                  </label>
                </div>

                {/* Desktop toggle */}
                <label className="hidden items-center gap-2 text-sm text-neutral-600 sm:flex">
                  <input
                    type="checkbox"
                    checked={!d.closed}
                    disabled={disabled}
                    onChange={(e) => update(key, { closed: !e.target.checked })}
                    className="size-4 accent-corisio-blue"
                  />
                  {d.closed ? "Closed" : "Open"}
                </label>

                {/* Times — always 2-up, but full width on mobile */}
                <div className="grid grid-cols-2 gap-2 sm:col-span-2 sm:gap-3">
                  <div>
                    <label className="sr-only" htmlFor={`${key}-open`}>{label} opens</label>
                    <input
                      id={`${key}-open`}
                      type="time"
                      value={d.open}
                      disabled={disabled || d.closed}
                      onChange={(e) => update(key, { open: e.target.value })}
                      className={timeClass}
                    />
                  </div>
                  <div>
                    <label className="sr-only" htmlFor={`${key}-close`}>{label} closes</label>
                    <input
                      id={`${key}-close`}
                      type="time"
                      value={d.close}
                      disabled={disabled || d.closed}
                      onChange={(e) => update(key, { close: e.target.value })}
                      className={timeClass}
                    />
                  </div>
                </div>
              </div>
              {err && (
                <p role="alert" className="mt-1.5 text-xs font-medium text-red-600 sm:pl-[250px]">
                  {err}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {!disabled && (
        <div className="border-t border-neutral-100 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={copyMondayToAll}
            className="text-sm font-semibold text-corisio-blue hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
          >
            Copy Monday&rsquo;s hours to every day
          </button>
        </div>
      )}
    </div>
  );
}