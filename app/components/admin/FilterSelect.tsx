"use client";

import AdminIcon from "@/app/components/admin/layout/AdminIcon";

export type FilterSelectOption<T extends string> = { value: T; label: string };

export type FilterSelectProps<T extends string> = {
  /** "" means no filter. */
  value: T | "";
  onChange: (value: T | "") => void;
  options: FilterSelectOption<T>[];
  /** Label of the "no filter" entry, e.g. "All statuses". */
  allLabel: string;
  /** Accessible name for the select. */
  ariaLabel: string;
};

/** A small filter dropdown for the toolbar next to the search box. */
export function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  allLabel,
  ariaLabel,
}: FilterSelectProps<T>) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value as T | "")}
        className="h-11 appearance-none rounded-xl border border-neutral-200 bg-white pl-4 pr-10 text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-corisio-blue/30"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <AdminIcon
        name="chevronDown"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
      />
    </div>
  );
}
