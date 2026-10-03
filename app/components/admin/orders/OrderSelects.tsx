"use client";

import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import type { AdminOrderPeriod, AdminOrderStatus } from "@/redux/types";
import { PERIOD_OPTIONS, STATUS_FILTER_OPTIONS } from "./formatters";

const SELECT_CLASS =
  "h-11 appearance-none rounded-xl border border-neutral-200 bg-white pl-4 pr-10 text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-corisio-blue/30";

function Chevron() {
  return (
    <AdminIcon
      name="chevronDown"
      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
    />
  );
}

export type PeriodSelectProps = {
  value: AdminOrderPeriod;
  onChange: (value: AdminOrderPeriod) => void;
};

/** The "This Month" select at the top right of the page. */
export function PeriodSelect({ value, onChange }: PeriodSelectProps) {
  return (
    <div className="relative">
      <select
        aria-label="Time period"
        value={value}
        onChange={(e) => onChange(e.target.value as AdminOrderPeriod)}
        className={SELECT_CLASS}
      >
        {PERIOD_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Chevron />
    </div>
  );
}

export type StatusFilterSelectProps = {
  /** "" means all statuses. */
  value: AdminOrderStatus | "";
  onChange: (value: AdminOrderStatus | "") => void;
};

/** Status filter that sits before the Filters / Export buttons. */
export function StatusFilterSelect({ value, onChange }: StatusFilterSelectProps) {
  return (
    <div className="relative">
      <select
        aria-label="Filter by status"
        value={value}
        onChange={(e) => onChange(e.target.value as AdminOrderStatus | "")}
        className={SELECT_CLASS}
      >
        <option value="">All statuses</option>
        {STATUS_FILTER_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Chevron />
    </div>
  );
}
