import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getServerUser } from "@/lib/auth/server";
import AdminShell from "@/app/components/admin/layout/AdminShell";
import {
  canAccessDashboard,
  DASHBOARD_AUTH_PATH,
  isStaffRole,
  needsStoreSetup,
  primaryStore,
  STORE_SETUP_PATH,
} from "@/lib/auth/staff";

/**
 * Everything inside (protected) needs a signed-in staff or store account,
 * and gets the admin sidebar + top bar around it. A store owner who hasn't set
 * up their store yet is sent to the store setup page first.
 */
export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getServerUser();

  if (!user) redirect(DASHBOARD_AUTH_PATH);
  if (needsStoreSetup(user)) redirect(STORE_SETUP_PATH);
  if (!canAccessDashboard(user)) redirect(`${DASHBOARD_AUTH_PATH}?error=no-access`);

  const { name, email, avatarUrl } = user;
  // Store users show their role in the store ("OWNER"), not the account role ("HAS_STORE")
  const role = isStaffRole(user.role) ? user.role : (primaryStore(user)?.role ?? user.role);

  return <AdminShell user={{ name, email, role, image: avatarUrl }}>{children}</AdminShell>;
}
