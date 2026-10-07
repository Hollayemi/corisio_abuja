"use client";

import type { DayKey, OpeningDay, OpeningHours } from "@/redux/types";
import { DAYS } from "./fields";

const timeClass =
  "h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-corisio-blue focus:outline-none focus:ring-2 focus:ring-corisio-blue/20 disabled:bg-neutral-50 disabled:text-neutral-400";

/** An open day needs a closing time after its opening time. Returns an error per day. */
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
    <div>
      <ul className="divide-y divide-neutral-100">
        {DAYS.map(({ key, label }) => {
          const d = value[key];
          return (
            <li key={key} className="py-3">
              <div className="grid grid-cols-[110px_auto] items-center gap-3 sm:grid-cols-[130px_120px_minmax(0,1fr)_minmax(0,1fr)]">
                <span className="text-sm font-medium text-neutral-900">{label}</span>

                <label className="flex items-center gap-2 text-sm text-neutral-600">
                  <input
                    type="checkbox"
                    checked={!d.closed}
                    disabled={disabled}
                    onChange={(e) => update(key, { closed: !e.target.checked })}
                    className="size-4 accent-corisio-500"
                  />
                  {d.closed ? "Closed" : "Open"}
                </label>

                <div className="col-span-2 grid grid-cols-2 gap-3 sm:col-span-2">
                  <input
                    type="time"
                    aria-label={`${label} opens`}
                    value={d.open}
                    disabled={disabled || d.closed}
                    onChange={(e) => update(key, { open: e.target.value })}
                    className={timeClass}
                  />
                  <input
                    type="time"
                    aria-label={`${label} closes`}
                    value={d.close}
                    disabled={disabled || d.closed}
                    onChange={(e) => update(key, { close: e.target.value })}
                    className={timeClass}
                  />
                </div>
              </div>
              {errors[key] && (
                <p role="alert" className="mt-1.5 text-xs text-red-600">
                  {errors[key]}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {!disabled && (
        <button
          type="button"
          onClick={copyMondayToAll}
          className="mt-3 rounded text-sm font-semibold text-corisio-blue hover:underline focus-visible:outline-2 focus-visible:outline-corisio-blue"
        >
          Copy Monday&rsquo;s hours to every day
        </button>
      )}
    </div>
  );
}
