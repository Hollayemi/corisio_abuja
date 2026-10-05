import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth/server";
import AdminAuthShell from "@/app/components/admin/auth/AdminAuthShell";
import AdminLoginForm from "@/app/components/admin/auth/AdminLoginForm";
import {
  canAccessDashboard,
  needsStoreSetup,
  NO_DASHBOARD_ACCESS,
  safeDashboardPath,
  STORE_SETUP_PATH,
} from "@/lib/auth/staff";

export const metadata: Metadata = { title: "Admin Sign In" };

export default async function AdminSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [user, params] = await Promise.all([getServerUser(), searchParams]);

  const callbackUrl = safeDashboardPath(params.callbackUrl);

  // Already signed in: nothing to do here
  if (needsStoreSetup(user)) redirect(STORE_SETUP_PATH);
  if (canAccessDashboard(user)) redirect(callbackUrl);

  return (
    <AdminAuthShell
      pill="Sign in to Luxol"
      title="Welcome Back."
      description="Pick up where you left off — your shortlist, vetting queue, and team are right where you left them."
    >
      <AdminLoginForm
        callbackUrl={callbackUrl}
        initialError={params.error === "no-access" ? NO_DASHBOARD_ACCESS : ""}
      />
    </AdminAuthShell>
  );
}
