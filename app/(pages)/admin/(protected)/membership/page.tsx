import type { Metadata } from "next";
import MembershipClient from "./MembershipClient";

export const metadata: Metadata = { title: "Membership" };

export default function AdminMembershipPage() {
  return <MembershipClient />;
}
