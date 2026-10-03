"use client";

import Image from "next/image";
import Link from "next/link";
import type { FormEvent } from "react";
import { siteConfig } from "@/app/config/site";
import { notify } from "@/lib/notify";
import AdminIcon from "./AdminIcon";
import UserMenu, { type AdminUser } from "./UserMenu";

export default function AdminHeader({
  user,
  collapsed,
  menuOpen,
  onToggleCollapsed,
  onOpenMenu,
}: {
  user: AdminUser;
  collapsed: boolean;
  menuOpen: boolean;
  onToggleCollapsed: () => void;
  onOpenMenu: () => void;
}) {
  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Search comes with the pages that have something to search.
  }

  return (
    <header className="flex h-[76px] shrink-0 items-center gap-4 bg-white px-4 lg:gap-0 lg:px-0">
      {/* Logo + sidebar toggle. Same width as the sidebar so search lines up with the content. */}
      <div className="flex shrink-0 items-center gap-3 lg:w-[266px] lg:justify-between lg:pl-8 lg:pr-7">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open menu"
          aria-controls="admin-sidebar"
          aria-expanded={menuOpen}
          className="rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-corisio-blue lg:hidden"
        >
          <AdminIcon name="menu" className="size-6" />
        </button>

        <Link href="/admin" aria-label={`${siteConfig.name} admin home`}>
          <Image
            src="/logo-horizontal.png"
            alt={siteConfig.name}
            width={130}
            height={42}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-controls="admin-sidebar"
          aria-expanded={!collapsed}
          className="hidden rounded-lg p-1.5 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-corisio-blue lg:inline-flex"
        >
          <AdminIcon
            name="collapse"
            className={`size-6 transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <form
        role="search"
        onSubmit={handleSearch}
        className="relative ml-2 hidden max-w-[487px] flex-1 md:block lg:ml-9"
      >
        <label htmlFor="admin-search" className="sr-only">
          Search for products, customers
        </label>
        <AdminIcon
          name="search"
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-neutral-500"
        />
        <input
          id="admin-search"
          type="search"
          placeholder="Search for products, customers..."
          className="h-[42px] w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-corisio-blue focus:outline-none focus:ring-2 focus:ring-corisio-blue/30"
        />
      </form>

      <div className="ml-auto flex items-center gap-4 sm:gap-7 lg:pr-9">
        <button
          type="button"
          onClick={() =>
            notify.info("You're all caught up", {
              message: "New notifications will show up here.",
              id: "admin-bell",
            })
          }
          aria-label="Notifications"
          className="rounded-lg p-1.5 text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-corisio-blue"
        >
          <AdminIcon name="bell" className="size-6" />
        </button>

        <UserMenu user={user} />
      </div>
    </header>
  );
}
