import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { authOptions } from "@/auth";
import AdminShell from "@/app/components/admin/layout/AdminShell";
import { isStaffRole } from "@/lib/auth/staff";

/**
 * Everything inside (protected) needs a signed-in staff account, and gets the
 * admin sidebar + top bar around it.
 */
export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/admin/auth");
  if (!isStaffRole(session.user?.role)) redirect("/admin/auth?error=no-access");

  const { name, email, role, image } = session.user;

  return <AdminShell user={{ name, email, role, image }}>{children}</AdminShell>;
}
