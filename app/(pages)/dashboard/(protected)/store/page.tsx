import { StoreProfileSection } from "@/app/components/admin/settings/StoreProfileSection";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Store Profile" };

export default function AdminCustomersPage() {
  return <StoreProfileSection />;
}
