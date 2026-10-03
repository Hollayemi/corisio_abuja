"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { adminNav } from "@/app/config/admin";
import { firstName, formatRole } from "@/lib/auth/staff";
import AdminIcon from "./AdminIcon";
import useAdminSignOut from "./useAdminSignOut";

export type AdminUser = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  image?: string | null;
};

function Avatar({ user }: { user: AdminUser }) {
  if (user.image) {
    return (
      // Remote profile photos (e.g. Google) don't go through next/image
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt=""
        referrerPolicy="no-referrer"
        className="size-[37px] shrink-0 rounded-full object-cover"
      />
    );
  }

  const initial = firstName(user.name, "A").charAt(0).toUpperCase();
  return (
    <span
      aria-hidden="true"
      className="flex size-[37px] shrink-0 items-center justify-center rounded-full bg-[#dcefd6] text-sm font-semibold text-corisio-blue"
    >
      {initial}
    </span>
  );
}

/** Profile button in the top bar, with a small menu (Settings, Log Out). */
export default function UserMenu({ user }: { user: AdminUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { signOut, loading } = useAdminSignOut();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const role = user.role ? formatRole(user.role) : "Staff";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-3 rounded-xl p-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
      >
        <Avatar user={user} />
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-[140px] truncate text-sm font-semibold leading-5 text-neutral-900">
            {user.name || "Admin"}
          </span>
          <span className="block max-w-[140px] truncate text-xs leading-4 text-neutral-500">
            {role}
          </span>
        </span>
        <AdminIcon
          name="chevronDown"
          className={`hidden size-4 text-neutral-700 transition-transform sm:block ${open ? "rotate-180" : ""}`}
        />
        <span className="sr-only">Account menu</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-neutral-100 bg-white p-2 shadow-lg"
        >
          <div className="px-3 pb-2 pt-1">
            <p className="truncate text-sm font-semibold text-neutral-900">
              {user.name || "Admin"}
            </p>
            {user.email && (
              <p className="truncate text-xs text-neutral-500">{user.email}</p>
            )}
          </div>
          <hr className="mb-1 border-neutral-100" />

          <Link
            href={adminNav.settings.href}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-neutral-700 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-corisio-blue"
          >
            <AdminIcon name="settings" className="size-[18px]" />
            Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            disabled={loading}
            className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-[#e5484d] hover:bg-[#fceceb] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[#e5484d]"
          >
            <AdminIcon name="logout" className="size-[18px]" />
            {loading ? "Logging out..." : "Log Out"}
          </button>
        </div>
      )}
    </div>
  );
}
