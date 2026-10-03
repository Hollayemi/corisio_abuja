"use client";

import { ModalHeader } from "@/app/components/admin/inventory/ModalHeader";
import { getErrorMessage } from "@/redux/config/errors";
import { useListAdminLoginActivityQuery } from "@/redux/slices/adminSettingsApi";
import { formatSessionTime } from "./formatters";

const RECENT = 20;

export type LoginActivityDialogProps = { close: () => void };

/** "Login activity": the most recent sign-in attempts, successful or not. */
export function LoginActivityDialog({ close }: LoginActivityDialogProps) {
  const { data, isLoading, isError, error, refetch } = useListAdminLoginActivityQuery({ limit: RECENT });
  const items = data?.data.items ?? [];

  return (
    <>
      <ModalHeader title="Settings" onBack={close} />

      <div className="max-h-[calc(90dvh-73px)] overflow-y-auto px-6 py-8 sm:px-10">
        <h3 className="text-xl font-semibold text-neutral-900">Login activity</h3>
        <p className="mt-1.5 text-sm text-neutral-400">Recent sign-ins to this administrator account.</p>
        <hr className="mt-6 border-neutral-200" />

        {isLoading ? (
          <div aria-hidden="true" className="mt-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-neutral-100" />
            ))}
          </div>
        ) : isError ? (
          <div role="alert" className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-neutral-600">{getErrorMessage(error)}</p>
            <button type="button" onClick={refetch} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50">
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-500">No sign-ins recorded yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {items.map((item) => {
              const where = [item.location, item.ipAddress].filter(Boolean).join(" · ");
              return (
                <li key={item.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-base font-medium text-neutral-900">{item.device}</p>
                    {where && <p className="mt-0.5 truncate text-sm text-neutral-400">{where}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-xs font-semibold uppercase tracking-wide ${item.success ? "text-corisio-blue" : "text-red-600"}`}>
                      {item.success ? "Successful" : "Failed"}
                    </p>
                    <p className="mt-0.5 text-sm text-neutral-500">{formatSessionTime(item.at)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
