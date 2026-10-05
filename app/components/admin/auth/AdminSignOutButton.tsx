"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLogout } from "@/lib/auth/hooks";
import { DASHBOARD_AUTH_PATH } from "@/lib/auth/staff";
import { notify } from "@/lib/notify";

export default function AdminSignOutButton() {
  const router = useRouter();
  const logout = useLogout();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    logout();
    notify.info("Signed out", { message: "See you soon." });
    router.replace(DASHBOARD_AUTH_PATH);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex h-11 items-center rounded-lg border border-neutral-300 px-5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
    >
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
