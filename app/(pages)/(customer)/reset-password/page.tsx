import type { Metadata } from "next";
import ResetPasswordClient from "./ResetPasswordClient";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/** The link in the "reset your password" email: /reset-password?token=... */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token } = await searchParams;
  return <ResetPasswordClient token={Array.isArray(token) ? token[0] : (token ?? "")} />;
}
