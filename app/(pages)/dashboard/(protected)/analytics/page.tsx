import type { Metadata } from "next";
import AdminPageHeader from "@/app/components/admin/AdminPageHeader";

export const metadata: Metadata = { title: "Analytics" };

export default function AdminAnalyticsPage() {
  return <AdminPageHeader title="Analytics" description="How the business is performing over time." />;
}
