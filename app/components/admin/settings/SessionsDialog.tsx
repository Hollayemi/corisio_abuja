"use client";

import { useState } from "react";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { ModalHeader } from "@/app/components/admin/inventory/ModalHeader";
import useAdminSignOut from "@/app/components/admin/layout/useAdminSignOut";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useListAdminSessionsQuery, useRevokeAdminSessionMutation } from "@/redux/slices/adminSettingsApi";
import type { AdminSession } from "@/redux/types/adminSettings";
import { formatDayMonthYear, formatSessionTime } from "./formatters";

function DeviceIcon() {
  return (
    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#e3f2de] text-corisio-blue">
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="5" y="5" width="14" height="10" rx="1.5" />
        <path d="M3 19h18" />
      </svg>
    </span>
  );
}

export type SessionsDialogProps = { close: () => void };

/** "Sessions & devices": every browser signed into this account, with a sign-out button each. */
export function SessionsDialog({ close }: SessionsDialogProps) {
  const { data, isLoading, isError, error, refetch } = useListAdminSessionsQuery();
  const [revoke] = useRevokeAdminSessionMutation();
  const { signOut } = useAdminSignOut();

  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const sessions = data?.data.items ?? [];

  async function handleRevoke(session: AdminSession) {
    setBusyId(session.id);
    try {
      await revoke(session.id).unwrap();
      if (session.isCurrent) {
        // Signing out of this very browser: leave the page too
        close();
        await signOut();
        return;
      }
      notify.success("Device signed out", { message: `${session.device} no longer has access.` });
      setConfirmingId(null);
    } catch (err) {
      notify.error("Couldn't sign that device out", { message: getErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <ModalHeader title="Settings" onBack={close} />

      <div className="max-h-[calc(90dvh-73px)] overflow-y-auto px-6 py-8 sm:px-10">
        <h3 className="text-xl font-semibold text-neutral-900">Sessions &amp; devices</h3>
        <p className="mt-1.5 text-sm text-neutral-400">Where you&apos;re signed in right now.</p>
        <hr className="mt-6 border-neutral-200" />

        {isLoading ? (
          <div aria-hidden="true" className="mt-6 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-neutral-100" />
            ))}
          </div>
        ) : isError ? (
          <div role="alert" className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-neutral-600">{getErrorMessage(error)}</p>
            <button type="button" onClick={refetch} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50">
              Try again
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-500">No active sessions.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {sessions.map((session) => {
              const confirming = confirmingId === session.id;
              const busy = busyId === session.id;
              return (
                <li key={session.id} className="flex flex-wrap items-center gap-4 py-5">
                  <DeviceIcon />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-medium text-neutral-900">{session.device}</p>
                      {session.isCurrent && (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-[#e7f4e4] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-corisio-blue">
                          <span aria-hidden="true" className="size-1.5 rounded-full bg-corisio-blue" />
                          This device
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-neutral-400">Signed in {formatDayMonthYear(session.signedInAt)}</p>
                  </div>

                  {confirming ? (
                    <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
                      <p className="text-xs text-neutral-600">
                        {session.isCurrent ? "You'll be signed out here too." : "Sign this device out?"}
                      </p>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        disabled={busy}
                        className="h-9 rounded-lg border border-neutral-300 px-3 text-xs font-medium text-neutral-800 hover:bg-neutral-50 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRevoke(session)}
                        disabled={busy}
                        className="h-9 rounded-lg bg-red-600 px-3 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-70"
                      >
                        {busy ? "Signing out..." : "Sign out"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Last active</p>
                        <p className="mt-0.5 text-sm text-neutral-500">
                          {session.isCurrent || !session.lastActiveAt ? "Active Now" : formatSessionTime(session.lastActiveAt)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(session.id)}
                        aria-label={`Sign out ${session.device}`}
                        className="flex size-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-800 transition hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-corisio-blue"
                      >
                        <AdminIcon name="trash" className="size-5" />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
