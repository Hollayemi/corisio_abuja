"use client";

import Link from "next/link";
import useOpenAuth from "@/app/components/auth/useOpenAuth";
import { SignupAccountType } from "@/redux/types";

/** Sign-up opens the register form with "I own a store" already picked. */
export default function BusinessActions({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const openAuth = useOpenAuth();
  const secondary =
    tone === "dark"
      ? "border-white/40 text-white hover:bg-white/10 focus-visible:outline-white"
      : "border-corisio-blue/30 text-corisio-blue hover:bg-corisio-blue/5 focus-visible:outline-corisio-blue";

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => openAuth("register", { accountType: SignupAccountType.STORE_OWNER })}
        className="inline-flex h-11 items-center rounded-lg bg-corisio-yellow px-6 text-sm font-semibold text-corisio-blue transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Create your store account
      </button>
      <Link
        href="/dashboard"
        className={`inline-flex h-11 items-center rounded-lg border px-6 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 ${secondary}`}
      >
        Already a seller? Open dashboard
      </Link>
    </div>
  );
}
