"use client";

import type { ReactNode } from "react";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";

/** The search + Filters + Export bar shared by the Inventory and Promotions tables. */
export function AdminToolbar({
  search,
  onSearchChange,
  placeholder = "Search using order id......",
  onExport,
  exportDisabled,
  extra,
  leading,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  onExport: () => void;
  exportDisabled?: boolean;
  /** Extra controls rendered before Filters/Export, e.g. a status select */
  extra?: ReactNode;
  /** Rendered before the search box, e.g. the Orders type tabs */
  leading?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {leading}

      <div className="relative min-w-0 flex-1">
        <AdminIcon
          name="search"
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl bg-neutral-100 pl-11 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-corisio-blue/30"
        />
      </div>

      {extra}

      <button
        type="button"
        disabled
        title="Coming soon"
        className="flex h-11 items-center gap-2 rounded-xl border border-neutral-200 px-4 text-sm font-medium text-neutral-700 opacity-60"
      >
        <AdminIcon name="filter" className="size-4" />
        Filters
      </button>

      <button
        type="button"
        onClick={onExport}
        disabled={exportDisabled}
        className="flex h-11 items-center gap-2 rounded-xl border border-neutral-200 px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <AdminIcon name="export" className="size-4" />
        Export
      </button>
    </div>
  );
}
