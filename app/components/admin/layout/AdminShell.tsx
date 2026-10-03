"use client";

import { useEffect, useState, type ReactNode } from "react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import type { AdminUser } from "./UserMenu";

/**
 * The frame around every admin page: top bar + sidebar, with the page itself
 * scrolling in the grey area. The sidebar collapses to icons on desktop and
 * becomes a slide-in drawer on small screens.
 */
export default function AdminShell({
  user,
  children,
}: {
  user: AdminUser;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Keep toasts below the top bar so they don't cover the profile menu
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--toast-top", "92px");
    return () => {
      root.style.removeProperty("--toast-top");
    };
  }, []);

  // Esc closes the mobile drawer
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <div className="flex h-dvh flex-col bg-white">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      <AdminHeader
        user={user}
        collapsed={collapsed}
        menuOpen={menuOpen}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
        onOpenMenu={() => setMenuOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        {menuOpen && (
          <div
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          />
        )}

        <AdminSidebar
          collapsed={collapsed}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />

        <main
          id="admin-main"
          className="min-w-0 flex-1 overflow-y-auto bg-[#f4f7fc] p-5 sm:p-9"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
