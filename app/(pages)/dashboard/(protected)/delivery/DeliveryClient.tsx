"use client";

import { useState } from "react";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import AdminPageHeader from "@/app/components/admin/AdminPageHeader";
import { FilterSelect } from "@/app/components/admin/FilterSelect";
import { DeliveryCalendar } from "@/app/components/admin/deliveries/DeliveryCalendar";
import { DeliveryDayPanel } from "@/app/components/admin/deliveries/DeliveryDayPanel";
import { DeliveryMonthNav } from "@/app/components/admin/deliveries/DeliveryMonthNav";
import {
  addMonthsKey,
  endOfMonthKey,
  isSameMonth,
  longDateLabel,
  monthGrid,
  startOfMonthKey,
  todayKey,
} from "@/app/components/admin/deliveries/dates";
import {
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_OPTIONS,
  DELIVERY_TYPE_LABELS,
  formatTimeRange,
} from "@/app/components/admin/deliveries/formatters";
import { csvCell } from "@/app/components/admin/orders/formatters";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useGetAdminDeliveryCalendarQuery,
  useLazyListAdminDeliveriesQuery,
} from "@/redux/slices/adminDeliveriesApi";
import type { AdminDeliveryStatus } from "@/redux/types/adminDeliveries";

const EXPORT_LIMIT = 500;

/** Keep the selection sensible when the month changes: today if it's in that month, else the 1st. */
function defaultSelection(month: string) {
  const today = todayKey();
  return isSameMonth(today, month) ? today : startOfMonthKey(month);
}

export default function DeliveryClient() {
  const [month, setMonth] = useState(() => startOfMonthKey(todayKey()));
  const [selected, setSelected] = useState(() => todayKey());
  const [status, setStatus] = useState<AdminDeliveryStatus | "">("");

  const grid = monthGrid(month);
  const calendar = useGetAdminDeliveryCalendarQuery(
    {
      from: grid[0],
      to: grid[grid.length - 1],
      status: status || undefined,
    },
    { pollingInterval: 60_000, skipPollingIfUnfocused: true },
  );
  const [loadForExport, exportState] = useLazyListAdminDeliveriesQuery();

  const days = calendar.data?.data.days ?? [];
  // currentData is empty right after the month/filters change; keep the previous grid dimmed meanwhile
  const calendarLoading = calendar.currentData === undefined && calendar.isFetching;

  function goToMonth(next: string) {
    setMonth(next);
    setSelected(defaultSelection(next));
  }

  async function handleExport() {
    try {
      const res = await loadForExport(
        {
          from: startOfMonthKey(month),
          to: endOfMonthKey(month),
              status: status || undefined,
          page: 1,
          perPage: EXPORT_LIMIT,
        },
        false,
      ).unwrap();

      const { items, total } = res.data;
      if (items.length === 0) {
        notify.error("Nothing to export", { message: "There are no deliveries this month." });
        return;
      }

      const header = ["Date", "Start", "End", "Customer", "Type", "Status"];
      const rows = items.map((d) => {
        const [start, end] = formatTimeRange(d.startTime, d.endTime).split(" - ");
        return [
          longDateLabel(d.date),
          start,
          end,
          d.customer.fullName,
          DELIVERY_TYPE_LABELS[d.type],
          DELIVERY_STATUS_LABELS[d.status],
        ];
      });
      const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `luxol-deliveries-${month.slice(0, 7)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      notify.success("Export started", {
        message:
          total > items.length
            ? `The first ${items.length} of ${total} deliveries were downloaded.`
            : `${items.length} deliveries were downloaded.`,
      });
    } catch (err) {
      notify.error("Couldn't export deliveries", { message: getErrorMessage(err) });
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Delivery & Schedule"
        description="Manage upcoming deliveries, scheduled orders and delivery status across Luxol."
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-neutral-100 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <DeliveryMonthNav
            month={month}
            onPrevious={() => goToMonth(addMonthsKey(month, -1))}
            onNext={() => goToMonth(addMonthsKey(month, 1))}
          />
          <button
            type="button"
            onClick={() => goToMonth(startOfMonthKey(todayKey()))}
            className="h-11 rounded-xl border border-neutral-200 px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Today
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            ariaLabel="Filter by delivery status"
            allLabel="All statuses"
            value={status}
            onChange={setStatus}
            options={DELIVERY_STATUS_OPTIONS}
          />
          <button
            type="button"
            onClick={handleExport}
            disabled={exportState.isFetching}
            className="flex h-11 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-wait disabled:opacity-60"
          >
            <AdminIcon name="export" className="size-4" />
            {exportState.isFetching ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>

      {calendar.isError && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-2xl bg-[#fbe9e9] px-5 py-3 text-sm text-red-700">
          <span>{getErrorMessage(calendar.error)}</span>
          <button type="button" onClick={calendar.refetch} className="font-medium underline">
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <DeliveryCalendar
          month={month}
          days={days}
          selected={selected}
          onSelect={setSelected}
          loading={calendarLoading}
        />
        <DeliveryDayPanel date={selected} status={status || undefined} />
      </div>
    </div>
  );
}
