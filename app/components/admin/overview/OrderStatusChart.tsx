"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ORDER_STATUS_LABELS, formatCount } from "@/app/components/admin/orders/formatters";
import type { AdminOrderStatus, AdminOverviewStatusCount } from "@/redux/types";
import { EASE_OUT, rise } from "./motion";

/** Follows an order's journey, so the bars read top to bottom like the pipeline. */
const ORDER: AdminOrderStatus[] = ["PENDING", "PROCESSING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

/** Where this month's orders stand: one labelled bar per status. */
export default function OrderStatusChart({ items }: { items: AdminOverviewStatusCount[] }) {
  const counts = new Map(items.map((i) => [i.status, i.count]));
  const rows = ORDER.map((status) => ({ status, count: counts.get(status) ?? 0 }));
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  const peak = Math.max(1, ...rows.map((r) => r.count));

  return (
    <motion.section
      variants={rise}
      aria-labelledby="order-status-heading"
      className="flex flex-col rounded-3xl bg-white p-6 sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="order-status-heading" className="text-lg font-semibold text-neutral-900">
            Orders by status
          </h2>
          <p className="mt-1 text-sm text-neutral-500">This month</p>
        </div>
        <Link
          href="/dashboard/orders"
          className="text-sm font-medium text-corisio-blue hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
        >
          View orders →
        </Link>
      </div>

      <p className="mt-5 text-2xl font-bold text-neutral-900 sm:text-[28px]">{formatCount(total)}</p>
      <p className="mt-1 text-xs text-neutral-500">{total === 1 ? "order" : "orders"} placed</p>

      {total === 0 ? (
        <p className="mt-6 flex flex-1 items-center justify-center rounded-2xl bg-neutral-50 px-6 py-10 text-center text-sm text-neutral-500">
          No orders this month yet.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.map((r, i) => {
            const pct = Math.round((r.count / total) * 100);
            return (
              <li key={r.status}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-neutral-700">{ORDER_STATUS_LABELS[r.status]}</span>
                  <span className="font-semibold text-neutral-900">
                    {formatCount(r.count)}
                    <span className="ml-1.5 text-xs font-normal text-neutral-500">{pct}%</span>
                  </span>
                </div>
                <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-neutral-100">
                  <motion.div
                    className="h-full rounded-full bg-corisio-500"
                    style={{ minWidth: r.count > 0 ? 12 : 0 }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${(r.count / peak) * 100}%` }}
                    transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.15 + i * 0.06 }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </motion.section>
  );
}
