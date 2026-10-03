"use client";

import { AnimatePresence, motion } from "framer-motion";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { PERIOD_OPTIONS, formatCount } from "@/app/components/admin/orders/formatters";
import { formatNaira } from "@/app/utils/product";
import { getErrorMessage } from "@/redux/config/errors";
import { useGetAdminTopProductsQuery } from "@/redux/slices/adminOverviewApi";
import type { AdminOrderPeriod } from "@/redux/types";
import { useState } from "react";

const PHRASE: Record<AdminOrderPeriod, string | null> = {
  today: "today",
  this_week: "this week",
  this_month: "this month",
  last_month: "last month",
  this_year: "this year",
  all_time: null,
};

const POLL = { pollingInterval: 60_000, skipPollingIfUnfocused: true } as const;

export default function TopProducts() {
  const [period, setPeriod] = useState<AdminOrderPeriod>("this_month");
  const { currentData, isFetching, isError, error, refetch } = useGetAdminTopProductsQuery(
    { period, limit: 4 },
    POLL,
  );
  const items = currentData?.data.items;
  const loading = currentData === undefined && isFetching;
  const phrase = PHRASE[period];

  return (
    <section aria-labelledby="top-products-heading" className="rounded-3xl bg-white p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="top-products-heading" className="text-lg font-semibold text-neutral-900">
            Top Selling Products
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Your best performing products {phrase ?? "of all time"}
          </p>
        </div>
        <div className="relative shrink-0">
          <select
            aria-label="Top products period"
            value={period}
            onChange={(e) => setPeriod(e.target.value as AdminOrderPeriod)}
            className="h-11 appearance-none rounded-xl border border-neutral-200 bg-white pl-4 pr-10 text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-corisio-blue/30"
          >
            {PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <AdminIcon
            name="chevronDown"
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto_auto] gap-x-6 border-b border-neutral-200 pb-3 text-sm font-medium text-neutral-700">
        <span>Product Details</span>
        <span className="w-24">Total Order</span>
        <span className="w-16 text-right">Price</span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.ul
            key="loading"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 border-b border-neutral-100 py-4 last:border-b-0">
                <div className="size-12 animate-pulse rounded-lg bg-neutral-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-neutral-100" />
                  <div className="h-3 w-20 animate-pulse rounded bg-neutral-100" />
                </div>
              </li>
            ))}
          </motion.ul>
        ) : isError ? (
          <motion.div
            key="error"
            role="alert"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-10 text-center"
          >
            <p className="text-sm text-neutral-600">{getErrorMessage(error)}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 h-10 rounded-lg border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-50"
            >
              Try again
            </button>
          </motion.div>
        ) : items && items.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-10 text-center text-sm text-neutral-500"
          >
            No sales {phrase ?? "yet"}.
          </motion.p>
        ) : (
          <motion.ul
            key={period}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          >
            {items?.map((p) => (
              <motion.li
                key={p.id}
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-6 border-b border-neutral-100 py-4 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 text-neutral-400">
                    {p.image ? (
                      // Product photos come from many hosts, so not next/image
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="size-full object-cover" />
                    ) : (
                      <AdminIcon name="package" className="size-6" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-900">{p.name}</p>
                    <p className="text-xs text-neutral-500">#{p.sku}</p>
                  </div>
                </div>
                <div className="w-24">
                  <p className="text-sm font-semibold text-neutral-900">{formatCount(p.totalOrders)}</p>
                  {phrase && (
                    <p className="text-xs text-neutral-500">
                      {formatCount(p.periodOrders)} {phrase}
                    </p>
                  )}
                </div>
                <p className="w-16 text-right text-sm font-semibold text-neutral-900">{formatNaira(p.price)}</p>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </section>
  );
}
