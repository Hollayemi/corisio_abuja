"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLogout } from "@/lib/auth/hooks";
import { notify } from "@/lib/notify";

/** Signs the admin out, says so with a toast and goes back to the sign in page. */
export default function useAdminSignOut() {
  const router = useRouter();
  const logout = useLogout();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    if (loading) return;
    setLoading(true);
    try {
      logout();
      notify.info("Signed out", { message: "See you soon." });
      router.replace("/dashboard/auth");
      router.refresh();
    } catch {
      notify.error("Couldn't sign you out", { message: "Please try again." });
      setLoading(false);
    }
  }

  return { signOut: handleSignOut, loading };
}
