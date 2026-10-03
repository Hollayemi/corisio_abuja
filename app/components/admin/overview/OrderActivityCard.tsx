"use client";

import { motion } from "framer-motion";
import { formatCount } from "@/app/components/admin/orders/formatters";
import type { AdminOverviewWeek } from "@/redux/types";
import AnimatedNumber from "./AnimatedNumber";
import { EASE_OUT } from "./motion";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
const RING_RADIUS = 44;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function todayKey() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function formatShortDate(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** The ring (this week against last week) and the Monday-to-Sunday bars. */
export default function OrderActivityCard({ week }: { week: AdminOverviewWeek }) {
  const today = todayKey();
  const ratio =
    week.lastWeekTotal > 0 ? Math.min(week.total / week.lastWeekTotal, 1) : week.total > 0 ? 1 : 0;
  const peak = Math.max(1, ...week.days.map((d) => d.orders));

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 px-2 py-2 lg:justify-start lg:px-6">
      <div className="flex flex-col items-center">
        <div
          role="img"
          aria-label={`${week.total} orders this week, against ${week.lastWeekTotal} last week`}
          className="relative size-[104px]"
        >
          <svg viewBox="0 0 104 104" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="52" cy="52" r={RING_RADIUS} fill="none" strokeWidth="9" className="stroke-[#f6efe2]" />
            <motion.circle
              cx="52"
              cy="52"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={RING_LENGTH}
              className="stroke-corisio-yellow"
              initial={{ strokeDashoffset: RING_LENGTH }}
              animate={{ strokeDashoffset: RING_LENGTH * (1 - ratio) }}
              transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.15 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold leading-none text-neutral-900">
              <AnimatedNumber value={week.total} format={formatCount} />
            </span>
            <span className="mt-1 text-[10px] text-corisio-yellow/70">of {formatCount(week.lastWeekTotal)}</span>
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold text-neutral-900">
          Total Orders <span aria-hidden="true">·</span>{" "}
          <span className="text-xs font-normal text-neutral-400">against last week</span>
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold text-neutral-900">
          This week{" "}
          <span className="ml-1 text-xs font-normal text-neutral-400">
            {formatShortDate(week.rangeStart)} - {formatShortDate(week.rangeEnd)}
          </span>
        </p>
        <ul className="mt-3 flex gap-2.5">
          {week.days.map((day, i) => {
            const isToday = day.date === today;
            const isFuture = day.date > today;
            const pct = isFuture ? 0 : (day.orders / peak) * 100;
            return (
              <li key={day.date} className="flex flex-col items-center gap-2">
                <div
                  title={isFuture ? undefined : `${day.orders} orders`}
                  className={`flex h-[78px] w-[22px] flex-col justify-end overflow-hidden rounded-full ${
                    isToday ? "bg-[#d9ecd0]" : "bg-neutral-100"
                  }`}
                >
                  <motion.div
                    className="w-full rounded-full bg-[#4a7c3a]"
                    style={{ minHeight: !isFuture && day.orders > 0 ? 22 : 0 }}
                    initial={{ height: "0%" }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.2 + i * 0.06 }}
                  />
                </div>
                <span
                  className={`text-[10px] ${isToday ? "font-bold text-corisio-blue" : "text-neutral-400"}`}
                >
                  {DAY_LETTERS[i]}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
