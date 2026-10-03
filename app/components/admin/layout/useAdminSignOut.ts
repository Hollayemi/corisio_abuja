"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { notify } from "@/lib/notify";

/** Signs the admin out, says so with a toast and goes back to the sign in page. */
export default function useAdminSignOut() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    if (loading) return;
    setLoading(true);
    try {
      await signOut({ redirect: false });
      notify.info("Signed out", { message: "See you soon." });
      router.replace("/admin/auth");
      router.refresh();
    } catch {
      notify.error("Couldn't sign you out", { message: "Please try again." });
      setLoading(false);
    }
  }

  return { signOut: handleSignOut, loading };
}
