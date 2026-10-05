import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import AdminAuthShell from "@/app/components/admin/auth/AdminAuthShell";
import AdminLoginForm from "@/app/components/admin/auth/AdminLoginForm";
import { isStaffRole, NO_ADMIN_ACCESS, safeAdminPath } from "@/lib/auth/staff";

export const metadata: Metadata = { title: "Admin Sign In" };

export default async function AdminSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [session, params] = await Promise.all([
    getServerSession(authOptions),
    searchParams,
  ]);

  const callbackUrl = safeAdminPath(params.callbackUrl);

  // Already signed in as staff: nothing to do here
  if (session && isStaffRole(session.user?.role)) redirect(callbackUrl);

  return (
    <AdminAuthShell
      pill="Sign in to Luxol"
      title="Welcome Back."
      description="Pick up where you left off — your shortlist, vetting queue, and team are right where you left them."
    >
      <AdminLoginForm
        callbackUrl={callbackUrl}
        initialError={params.error === "no-access" ? NO_ADMIN_ACCESS : ""}
      />
    </AdminAuthShell>
  );
}
