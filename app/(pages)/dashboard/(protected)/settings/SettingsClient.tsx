"use client";

import { useState } from "react";
import AdminPageHeader from "@/app/components/admin/AdminPageHeader";
import { GeneralTab } from "@/app/components/admin/settings/GeneralTab";
import { NotificationsTab } from "@/app/components/admin/settings/NotificationsTab";
import { ProfileTab } from "@/app/components/admin/settings/ProfileTab";
import { SecurityTab } from "@/app/components/admin/settings/SecurityTab";
import { SettingsNav, type SettingsTab } from "@/app/components/admin/settings/SettingsNav";
import { StoreProfileSection } from "@/app/components/admin/settings/StoreProfileSection";
import { TeamTab } from "@/app/components/admin/settings/TeamTab";

export type SettingsClientProps = {
  /** From the ?tab= in the link, so a tab can be linked to directly. */
  initialTab: SettingsTab;
};

export default function SettingsClient({ initialTab }: SettingsClientProps) {
  const [tab, setTab] = useState<SettingsTab>(initialTab);

  function handleChange(next: SettingsTab) {
    setTab(next);
    // Keep the address in step without reloading, so refresh and share links land on the same tab
    window.history.replaceState(null, "", `?tab=${next}`);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Settings"
        description="Manage your Luxol store, operations, payments, notifications and account preferences."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <SettingsNav value={tab} onChange={handleChange} />

        <div className="min-w-0">
          {tab === "general" && <GeneralTab />}
          {tab === "profile" && (
            <>
              <ProfileTab />
              <StoreProfileSection />
            </>
          )}
          {tab === "security" && <SecurityTab />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "team" && <TeamTab />}
        </div>
      </div>
    </div>
  );
}
