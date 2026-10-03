"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { AccountTab } from "@/app/data/account-data";
import Sidebar from "./components/Sidebar";
import SupportHelpPanel from "./components/SupportHelpPanel";
import PersonalInformationPanel from "./components/PersonalInformationPanel";
import ManageAddressPanel from "./components/ManageAddressPanel";

export default function AccountClient({ initialTab }: { initialTab: AccountTab }) {
  const router = useRouter();
  const pathname = usePathname();

  const [tab, setTab] = useState<AccountTab>(initialTab);

  function handleSelect(next: AccountTab) {
    setTab(next);
    router.replace(next === "personal" ? pathname : `${pathname}?tab=${next}`, {
      scroll: false,
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
      <Sidebar active={tab} onSelect={handleSelect} />

      <div>
        {tab === "personal" && <PersonalInformationPanel />}
        {tab === "address" && <ManageAddressPanel />}
        {tab === "support" && <SupportHelpPanel />}
      </div>
    </div>
  );
}
