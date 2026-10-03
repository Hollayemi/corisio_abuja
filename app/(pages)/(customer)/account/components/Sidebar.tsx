"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { ChevronRightIcon } from "@/app/components/ui/icons";
import { ACCOUNT_NAV, type AccountTab } from "@/app/data/account-data";

export default function Sidebar({
  active,
  onSelect,
}: {
  active: AccountTab;
  onSelect: (tab: AccountTab) => void;
}) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogOut() {
    if (!confirm("Log out of your Luxol account?")) return;
    setLoggingOut(true);
    try {
      await signOut({ callbackUrl: "/" });
    } finally {
      setLoggingOut(false);
    }
  }

  const itemClass = (isActive: boolean) =>
    `flex w-full items-center justify-between gap-3 rounded-xl px-5 py-4 text-left text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue ${
      isActive
        ? "bg-corisio-yellow text-black"
        : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200/70"
    }`;

  return (
    <div>
      <h1 className="text-lg font-bold text-neutral-900">Manage Your Subscription</h1>

      <nav aria-label="Account" className="mt-5 flex flex-col gap-3">
        {ACCOUNT_NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={active === item.id ? "page" : undefined}
            className={itemClass(active === item.id)}
          >
            {item.label}
            <ChevronRightIcon className="size-4 shrink-0" />
          </button>
        ))}

        <button
          type="button"
          onClick={handleLogOut}
          disabled={loggingOut}
          className={`${itemClass(false)} disabled:opacity-60`}
        >
          {loggingOut ? "Logging out…" : "Log Out"}
          <ChevronRightIcon className="size-4 shrink-0" />
        </button>
      </nav>
    </div>
  );
}
