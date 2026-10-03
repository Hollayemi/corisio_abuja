"use client";

import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import type { AdminCustomerStatus } from "@/redux/types";
import { CUSTOMER_STATUS_FILTER_OPTIONS } from "./formatters";

export type CustomerStatusSelectProps = {
  /** "" means all statuses. */
  value: AdminCustomerStatus | "";
  onChange: (value: AdminCustomerStatus | "") => void;
};

/** Status filter that sits before the Filters / Export buttons. */
export function CustomerStatusSelect({ value, onChange }: CustomerStatusSelectProps) {
  return (
    <div className="relative">
      <select
        aria-label="Filter by status"
        value={value}
        onChange={(e) => onChange(e.target.value as AdminCustomerStatus | "")}
        className="h-11 appearance-none rounded-xl border border-neutral-200 bg-white pl-4 pr-10 text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-corisio-blue/30"
      >
        <option value="">All statuses</option>
        {CUSTOMER_STATUS_FILTER_OPTIONS.map((option) => (
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
