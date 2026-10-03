"use client";

import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useGetAdminNotificationSettingsQuery,
  useUpdateAdminNotificationSettingsMutation,
} from "@/redux/slices/adminSettingsApi";
import type {
  AdminNotificationChannel,
  AdminNotificationGroup,
  AdminNotificationSettings,
} from "@/redux/types/adminSettings";
import { CheckToggle, SectionError, SectionSkeleton, SettingsCard, Switch } from "./Controls";

const timeInputClass =
  "h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 focus:border-corisio-blue focus:outline-none focus:ring-2 focus:ring-corisio-blue/20";

/** Notification Settings tab: quiet hours, sound, and an email / push switch per event. */
export function NotificationsTab() {
  const { data, isLoading, isError, error, refetch } = useGetAdminNotificationSettingsQuery();
  const [save] = useUpdateAdminNotificationSettingsMutation();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SectionSkeleton rows={2} />
        <SectionSkeleton rows={3} />
      </div>
    );
  }
  if (isError || !data) return <SectionError message={getErrorMessage(error)} onRetry={refetch} />;

  const settings = data.data;

  /** Each change saves on its own. The screen updates at once and snaps back if the save fails. */
  async function persist(body: Parameters<typeof save>[0]) {
    try {
      await save(body).unwrap();
    } catch (err) {
      notify.error("Couldn't save that change", { id: "admin-notifications", message: getErrorMessage(err) });
    }
  }

  return (
    <div className="space-y-6">
      <GeneralCard settings={settings} persist={persist} />
      {settings.groups.map((group) => (
        <GroupCard key={group.id} group={group} persist={persist} />
      ))}
    </div>
  );
}

type Persist = (body: Parameters<ReturnType<typeof useUpdateAdminNotificationSettingsMutation>[0]>[0]) => Promise<void>;

function GeneralCard({ settings, persist }: { settings: AdminNotificationSettings; persist: Persist }) {
  const { quietHours } = settings;

  return (
    <SettingsCard className="px-6 py-7 sm:px-8">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Quiet Hours</h3>
          <p className="mt-1 text-sm text-neutral-400">
            Silence push notifications between these times. Urgent items still arrive.
          </p>
        </div>
        <Switch
          checked={quietHours.enabled}
          onChange={(enabled) => persist({ quietHours: { enabled } })}
          label="Quiet Hours"
        />
      </div>

      {quietHours.enabled && (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-600">
          <label className="flex items-center gap-2">
            From
            <input
              type="time"
              value={quietHours.startTime}
              onChange={(e) => e.target.value && persist({ quietHours: { startTime: e.target.value } })}
              className={timeInputClass}
            />
          </label>
          <label className="flex items-center gap-2">
            to
            <input
              type="time"
              value={quietHours.endTime}
              onChange={(e) => e.target.value && persist({ quietHours: { endTime: e.target.value } })}
              className={timeInputClass}
            />
          </label>
        </div>
      )}

      <hr className="my-6 border-neutral-200" />

      <div className="flex items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">In-App Sound</h3>
          <p className="mt-1 text-sm text-neutral-400">Sound played for new notifications.</p>
        </div>
        <div className="relative">
          <select
            aria-label="In-App Sound"
            value={settings.sound}
            onChange={(e) => persist({ sound: e.target.value })}
            className="h-11 appearance-none rounded-xl bg-neutral-100 pl-4 pr-10 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-corisio-blue/30"
          >
            {settings.soundOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <AdminIcon name="chevronDown" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-neutral-700" />
        </div>
      </div>
    </SettingsCard>
  );
}

function GroupCard({ group, persist }: { group: AdminNotificationGroup; persist: Persist }) {
  function toggle(key: string, channel: AdminNotificationChannel, value: boolean) {
    return persist({ preferences: [{ key, [channel]: value }] });
  }

  return (
    <SettingsCard>
      <div className="flex items-end justify-between gap-6 px-6 pb-4 pt-7 sm:px-8">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">{group.title}</h3>
          <p className="mt-1 text-sm text-neutral-400">{group.description}</p>
        </div>
        <div aria-hidden="true" className="flex shrink-0 gap-3 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
          <span className="w-[52px] text-center">Email</span>
          <span className="w-[52px] text-center">Push</span>
        </div>
      </div>

      <ul className="border-t border-neutral-200 pb-3">
        {group.items.map((item) => (
          <li
            key={item.key}
            className="flex items-center justify-between gap-6 border-b border-neutral-100 px-6 py-3 last:border-b-0 sm:px-8"
          >
            <span className="text-sm text-neutral-800">{item.label}</span>
            <span className="flex shrink-0 gap-3">
              <CheckToggle
                checked={item.email}
                onChange={(v) => toggle(item.key, "email", v)}
                label={`${item.label} by email`}
              />
              <CheckToggle
                checked={item.push}
                onChange={(v) => toggle(item.key, "push", v)}
                label={`${item.label} by push notification`}
              />
            </span>
          </li>
        ))}
      </ul>
    </SettingsCard>
  );
}
