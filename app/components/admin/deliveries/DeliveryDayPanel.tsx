"use client";

import { useState } from "react";
import { getErrorMessage } from "@/redux/config/errors";
import { useListAdminDeliveriesQuery } from "@/redux/slices/adminDeliveriesApi";
import type { AdminDeliveryStatus, AdminDeliveryType } from "@/redux/types/adminDeliveries";
import { DeliveryCard } from "./DeliveryCard";
import { longDateLabel, todayKey } from "./dates";

const PAGE_STEP = 20;
/** Deliveries change status all day: keep the list fresh while the tab is in view. */
const POLL = { pollingInterval: 60_000, skipPollingIfUnfocused: true } as const;

export type DeliveryDayPanelProps = {
  /** The selected date key, "2026-09-13". */
  date: string;
  type?: AdminDeliveryType;
  status?: AdminDeliveryStatus;
};

/** The "Delivery Schedules" card: every delivery on the selected day. */
export function DeliveryDayPanel({ date, type, status }: DeliveryDayPanelProps) {
  // Remember the page size per day, so picking another day starts small again.
  const [limits, setLimits] = useState<Record<string, number>>({});
  const limit = limits[date] ?? PAGE_STEP;

  const { currentData, isFetching, isError, error, refetch } = useListAdminDeliveriesQuery(
    { date, type, status, page: 1, perPage: limit },
    POLL,
  );

  const list = currentData?.data;
  const loading = currentData === undefined && isFetching && !isError;
  const items = list?.items ?? [];
  const total = list?.total ?? 0;
  const isToday = date === todayKey();

  return (
    <section
      aria-labelledby="delivery-panel-heading"
      className="rounded-3xl border border-neutral-100 bg-white p-6 xl:sticky xl:top-4"
    >
      <h2 id="delivery-panel-heading" className="text-base font-semibold text-neutral-900">
        Delivery Schedules
      </h2>
      <p className="mt-2 text-sm text-neutral-400">
        {isToday
          ? "All the deliveries schedule for today will be shown here."
          : "All the deliveries scheduled for the selected day are shown here."}
      </p>

      <h3 className="mt-6 border-b border-neutral-200 pb-4 text-xl font-bold text-neutral-900">
        {longDateLabel(date)}
        {list && <span> ({total})</span>}
      </h3>

      <div className="mt-5 xl:max-h-[640px] xl:overflow-y-auto xl:pr-1">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-neutral-100" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-neutral-600">{getErrorMessage(error)}</p>
            <button
              type="button"
              onClick={refetch}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
            >
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-500">
            {type || status ? "No deliveries match these filters on this day." : "No deliveries scheduled for this day."}
          </p>
        ) : (
          <>
            <ul className="space-y-3">
              {items.map((delivery) => (
                <DeliveryCard key={delivery.id} delivery={delivery} />
              ))}
            </ul>

            {items.length < total && (
              <button
                type="button"
                onClick={() => setLimits((l) => ({ ...l, [date]: limit + PAGE_STEP }))}
                disabled={isFetching}
                className="mt-4 w-full rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-corisio-blue transition hover:bg-neutral-50 disabled:opacity-60"
              >
                {isFetching ? "Loading..." : `Show more (${total - items.length} left)`}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
