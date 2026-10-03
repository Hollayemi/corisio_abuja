"use client";

import type { AdminDeliveryDay } from "@/redux/types/adminDeliveries";
import { fromDateKey, isSameMonth, longDateLabel, monthGrid, todayKey, WEEKDAYS } from "./dates";
import { DELIVERY_TYPE_SHORT, DELIVERY_TYPE_STYLES, formatTime } from "./formatters";

export type DeliveryCalendarProps = {
  /** Any date key in the visible month. */
  month: string;
  /** Days that have deliveries (days without any can be missing). */
  days: AdminDeliveryDay[];
  /** The selected date key. */
  selected: string;
  onSelect: (date: string) => void;
  /** Dims the grid while a new month's data loads. */
  loading?: boolean;
};

/** Six-week month grid. Each cell is a button: pick a day to see its deliveries. */
export function DeliveryCalendar({ month, days, selected, onSelect, loading }: DeliveryCalendarProps) {
  const today = todayKey();
  const byDate = new Map(days.map((d) => [d.date, d]));
  const cells = monthGrid(month);

  return (
    <div className="overflow-x-auto rounded-3xl border border-neutral-100 bg-white">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-7 border-b border-neutral-100">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-5 text-center text-xs font-medium uppercase tracking-wide text-neutral-500"
            >
              {day}
            </div>
          ))}
        </div>

        <div
          role="group"
          aria-label="Calendar"
          aria-busy={loading}
          className={`grid grid-cols-7 transition-opacity ${loading ? "opacity-60" : ""}`}
        >
          {cells.map((key) => {
            const inMonth = isSameMonth(key, month);
            const isSelected = key === selected;
            const isToday = key === today;
            const day = byDate.get(key);
            const total = day?.total ?? 0;
            const previews = day?.previews ?? [];
            const more = total - previews.length;
            const dayNumber = fromDateKey(key).getDate();

            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelect(key)}
                aria-pressed={isSelected}
                aria-label={`${longDateLabel(key)}, ${total} ${total === 1 ? "delivery" : "deliveries"}`}
                className={`relative flex min-h-[112px] flex-col gap-1 border-b border-r border-neutral-100 p-2 text-left transition focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-corisio-blue ${
                  isSelected
                    ? "z-10 bg-neutral-50 outline outline-2 outline-neutral-800"
                    : "hover:bg-neutral-50/70"
                }`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="pt-0.5 text-[11px] text-neutral-500">
                    {more > 0 ? `+${more} more` : ""}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      isToday
                        ? "flex size-6 items-center justify-center rounded-full bg-corisio-blue text-white"
                        : inMonth
                          ? "text-neutral-900"
                          : "text-neutral-400"
                    }`}
                  >
                    {dayNumber}
                  </span>
                </span>

                {previews.map((p) => (
                  <span
                    key={p.id}
                    className={`flex items-center gap-2 rounded-md px-2 py-1 text-[11px] font-medium ${
                      DELIVERY_TYPE_STYLES[p.type].chip
                    } ${inMonth ? "" : "opacity-60"}`}
                  >
                    <span className="truncate">{formatTime(p.startTime)}</span>
                    <span className="truncate">{DELIVERY_TYPE_SHORT[p.type]}</span>
                  </span>
                ))}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
