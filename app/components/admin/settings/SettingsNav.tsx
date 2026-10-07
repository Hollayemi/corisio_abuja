"use client";

import type { ReactNode } from "react";

export type SettingsTab = "general" | "profile" | "security" | "notifications" | "team";

export const SETTINGS_TABS: SettingsTab[] = ["general", "profile", "security", "notifications", "team"];
export const settingsTab: SettingsTab[] = ["general", "profile", "security", "notifications", "team"];

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "size-5",
  "aria-hidden": true,
} as const;

const ITEMS: { value: SettingsTab; label: string; icon: ReactNode }[] = [
  {
    value: "general",
    label: "General Settings",
    icon: (
      <svg {...svgProps}>
        <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
        <circle cx="15" cy="7" r="2" />
        <circle cx="9" cy="17" r="2" />
      </svg>
    ),
  },
  {
    value: "profile",
    label: "Profile",
    icon: (
      <svg {...svgProps}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-3.6 3.6-6 8-6s8 2.4 8 6" />
      </svg>
    ),
  },
  {
    value: "security",
    label: "Security",
    icon: (
      <svg {...svgProps}>
        <rect x="5" y="11" width="14" height="10" rx="3" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        <path d="M12 15.5v1.5" />
      </svg>
    ),
  },
  {
    value: "notifications",
    label: "Notification Settings",
    icon: (
      <svg {...svgProps}>
        <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" />
        <path d="M10 21h4" />
      </svg>
    ),
  },
  {
    value: "team",
    label: "Admin Users & Permissions",
    icon: (
      <svg {...svgProps}>
        <rect x="3.5" y="4" width="17" height="14" rx="3" />
        <path d="M8 9.5h1M11.5 9.5H16M8 13h8M9 21h6" />
      </svg>
    ),
  },
];

export type SettingsNavProps = {
  value: SettingsTab;
  onChange: (tab: SettingsTab) => void;
};

/** The left card: "Control Everything". */
export function SettingsNav({ value, onChange }: SettingsNavProps) {
  return (
    <nav
      aria-label="Settings sections"
      className="rounded-3xl border border-neutral-100 bg-white p-4 lg:sticky lg:top-4 lg:min-h-[420px]"
    >
      <p className="px-4 pb-3 pt-2 text-sm text-neutral-400">Control Everything</p>
      <ul className="space-y-1">
        {ITEMS.map((item) => {
          const active = item.value === value;
          return (
            <li key={item.value}>
              <button
                type="button"
                onClick={() => onChange(item.value)}
                aria-current={active ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm transition focus-visible:outline-2 focus-visible:outline-corisio-blue ${
                  active
                    ? "bg-corisio-100 font-medium text-corisio-blue"
                    : "text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
