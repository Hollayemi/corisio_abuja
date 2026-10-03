import type { Metadata } from "next";
import { SETTINGS_TABS, settingsTab, type SettingsTab } from "@/app/components/admin/settings/SettingsNav";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = { title: "Settings" };
type SearchParams = Promise<{ tab?: string | string[] }>;

export default async function AdminSettingsPage({ searchParams }: { searchParams: SearchParams }) {
  const { tab } = await searchParams;
  const requested = Array.isArray(tab) ? tab[0] : tab;
  const initialTab: SettingsTab = ["general", "profile", "security", "notifications", "team"]?.includes(requested as SettingsTab)
    ? (requested as SettingsTab)
    : "profile";

  return <SettingsClient initialTab={initialTab} />;
}
