"use client";

import type { ReactNode } from "react";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useGetAdminSecurityQuery, useSetAdminTwoFactorMutation } from "@/redux/slices/adminSettingsApi";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { SectionError, SectionSkeleton, SettingsCard, Switch } from "./Controls";
import { formatDayMonthYear } from "./formatters";
import { LoginActivityDialog } from "./LoginActivityDialog";
import { SessionsDialog } from "./SessionsDialog";

function Row({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-6 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
        <p className="mt-1 text-sm text-neutral-400">{description}</p>
      </div>
      {children}
    </div>
  );
}

function ChevronRow({ title, description, onClick }: { title: string; description: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-mx-3 flex w-[calc(100%+1.5rem)] items-center justify-between gap-6 rounded-xl px-3 py-6 text-left transition hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-corisio-blue"
    >
      <span className="min-w-0">
        <span className="block text-base font-semibold text-neutral-900">{title}</span>
        <span className="mt-1 block text-sm text-neutral-400">{description}</span>
      </span>
      <AdminIcon name="chevronRight" className="size-5 shrink-0 text-neutral-800" />
    </button>
  );
}

/** Security tab: password, two-factor, sessions and login activity. */
export function SecurityTab() {
  const { openDialog } = useDialog();
  const { data, isLoading, isError, error, refetch } = useGetAdminSecurityQuery();
  const [setTwoFactor, { isLoading: toggling }] = useSetAdminTwoFactorMutation();

  if (isLoading) return <SectionSkeleton rows={4} />;
  if (isError || !data) return <SectionError message={getErrorMessage(error)} onRetry={refetch} />;

  const security = data.data;

  async function handleTwoFactor(enabled: boolean) {
    try {
      await setTwoFactor({ enabled }).unwrap();
      notify.success(enabled ? "Two-factor turned on" : "Two-factor turned off", { id: "admin-2fa" });
    } catch (err) {
      // The switch has already snapped back
      notify.error("Couldn't change two-factor", { message: getErrorMessage(err) });
    }
  }

  return (
    <SettingsCard className="px-6 py-8 sm:px-8">
      <div className="divide-y divide-neutral-200">
        <Row
          title="Change Password"
          description={
            security.passwordChangedAt
              ? `Last changed ${formatDayMonthYear(security.passwordChangedAt)}`
              : "You haven't changed your password yet."
          }
        >
          <button
            type="button"
            onClick={() =>
              openDialog(({ close }) => <ChangePasswordDialog close={close} />, {
                title: "Change password",
                side: "center",
                width: "lg",
              })
            }
            className="h-12 shrink-0 rounded-xl bg-corisio-500 px-6 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
          >
            Change Password
          </button>
        </Row>

        <Row title="Two-Factor Authentication" description="Add an extra layer of security to your account.">
          <Switch
            checked={security.twoFactorEnabled}
            onChange={handleTwoFactor}
            label="Two-Factor Authentication"
            disabled={toggling}
          />
        </Row>

        <ChevronRow
          title="Active Sessions"
          description="View and manage devices currently signed into the admin account."
          onClick={() =>
            openDialog(({ close }) => <SessionsDialog close={close} />, {
              title: "Active sessions",
              side: "center",
              width: "xl",
            })
          }
        />

        <ChevronRow
          title="Login Activity"
          description="Review recent administrator login activity."
          onClick={() =>
            openDialog(({ close }) => <LoginActivityDialog close={close} />, {
              title: "Login activity",
              side: "center",
              width: "xl",
            })
          }
        />
      </div>
    </SettingsCard>
  );
}
