import type { Metadata } from "next";
import AcceptInviteForm from "@/app/components/admin/auth/AcceptInviteForm";

export const metadata: Metadata = { title: "Join the Team" };

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token } = await searchParams;

  return <AcceptInviteForm token={(Array.isArray(token) ? token[0] : token) ?? ""} />;
}
