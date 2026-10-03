"use client";

import { MEMBERSHIP_TABS, type MembershipTab } from "./formatters";

export type MembershipTabsProps = {
  value: MembershipTab;
  onChange: (value: MembershipTab) => void;
};

/** Overview / Subscribers / Deliveries / Proteins. */
export function MembershipTabs({ value, onChange }: MembershipTabsProps) {
  return (
    <div role="tablist" aria-label="Membership sections" className="flex flex-wrap items-center gap-1">
      {MEMBERSHIP_TABS.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`h-10 rounded-xl px-4 text-sm transition focus-visible:outline-2 focus-visible:outline-corisio-blue ${
              active
                ? "bg-[#c9e6c4] font-medium text-neutral-900"
                : "text-neutral-500 hover:bg-neutral-50"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
