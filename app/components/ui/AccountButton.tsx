"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { GemIcon, HeartIcon, UserIcon } from "./icons";
import useOpenAuth from "../auth/useOpenAuth";

const base =
  "inline-flex items-center rounded-lg border border-corisio-yellow px-4 text-xs font-medium text-corisio-yellow transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/**
 * Header account control:
 * signed out -> "Register / Log In" button that opens the auth dialog
 * signed in  -> "Hi, <first name>" menu with a Log out button
 */
export default function AccountButton({
  size = "lg",
  onAction,
}: {
  size?: "lg" | "sm";
  /** Called when the user picks an action (e.g. to close a mobile menu). */
  onAction?: () => void;
}) {
  const { data: session, status } = useSession();
  const openAuth = useOpenAuth();
  const height = size === "lg" ? "h-11" : "h-10";

  // Same size as the button, so the header doesn't jump while the session loads
  if (status === "loading") {
    return (
      <span aria-hidden="true" className={`invisible ${base} ${height}`}>
        Register / Log In
      </span>
    );
  }

  if (status === "authenticated") {
    const label = session.user?.name || session.user?.email || "Account";
    const firstName = label.split(/\s+/)[0];

    return (
      <details className="group relative">
        <summary
          className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-lg text-white transition hover:text-corisio-yellow [&::-webkit-details-marker]:hidden"
          aria-label={`Account, ${name}`}
        >
          <UserIcon className="h-5 w-5" />
        </summary>

        <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-lg border border-neutral-200 bg-white p-2 text-neutral-900 shadow-lg">
          <p className="truncate px-3 py-2 text-xs text-neutral-500">
            Hi, {firstName}
            {session.user?.email ? ` · ${session.user.email}` : ""}
          </p>
          <Link
            href="/account"
            onClick={onAction}
            className="block rounded-md px-3 py-2 text-sm hover:bg-neutral-50"
          >
            My Profile
          </Link>
          <Link
            href="/orders"
            onClick={onAction}
            className="block rounded-md px-3 py-2 text-sm hover:bg-neutral-50"
          >
            My Orders
          </Link>
          <button
            type="button"
            onClick={() => {
              onAction?.();
              void signOut({ redirect: false });
            }}
            className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-neutral-50"
          >
            Log out
          </button>
        </div>
      </details>
    );
  }

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => {
        onAction?.();
        openAuth("login");
      }}
      className={`${base} ${height} hover:bg-corisio-yellow hover:text-black`}
    >
      Register / Log In
    </button>
  );
}

/** Plain icon link used for Wishlist / Loyalty in the header when signed in. */
export function HeaderIconLink({
  href,
  label,
  icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: "heart" | "gem";
  onClick?: () => void;
}) {
  const Icon = icon === "heart" ? HeartIcon : GemIcon;
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-lg text-white transition hover:text-corisio-yellow"
    >
      <Icon className="h-5 w-5" />
    </Link>
  );
}
