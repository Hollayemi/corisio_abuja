"use client";

import type { AdminOrderType } from "@/redux/types";
import { formatCount, ORDER_TABS } from "./formatters";

export type OrderTabsProps = {
  value: AdminOrderType;
  onChange: (value: AdminOrderType) => void;
  /** The small counts on each tab. Hidden until they load. */
  counts?: Record<AdminOrderType, number>;
};

/** Shop Orders / Freezer Planner Orders. */
export function OrderTabs({ value, onChange, counts }: OrderTabsProps) {
  return (
    <div role="tablist" aria-label="Order type" className="flex flex-wrap items-center gap-1">
      {ORDER_TABS.map((tab) => {
        const active = tab.value === value;
        const count = counts?.[tab.value];
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`flex h-10 items-center gap-2 rounded-xl px-4 text-sm transition focus-visible:outline-2 focus-visible:outline-corisio-blue ${
              active
                ? "bg-[#c9e6c4] font-medium text-neutral-900"
                : "text-neutral-500 hover:bg-neutral-50"
            }`}
          >
            {tab.label}
            {count !== undefined && (
              <span
                className={`rounded-md px-1.5 py-0.5 text-xs ${
                  active ? "bg-white text-neutral-900" : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {formatCount(count)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
