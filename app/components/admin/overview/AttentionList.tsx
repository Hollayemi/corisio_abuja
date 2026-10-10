"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { formatNaira } from "@/app/utils/product";
import type { AdminAttentionItem, AdminAttentionKind, AdminAttentionStatus } from "@/redux/types";

const KIND_LABELS: Record<AdminAttentionKind, string> = {
  SHOP: "Order",
  FREEZER_PLANNER: "Freezer Planner",
  MEMBERSHIP: "Membership",
};

const KIND_HREFS: Record<AdminAttentionKind, string> = {
  SHOP: "/dashboard/orders",
  FREEZER_PLANNER: "/dashboard/orders",
  MEMBERSHIP: "/dashboard/membership",
};

const STATUS_LABELS: Record<AdminAttentionStatus, string> = {
  PAYMENT_ISSUE: "Payment issue",
  PROCESSING: "Processing",
  PENDING: "Pending",
};

const STATUS_STYLES: Record<AdminAttentionStatus, string> = {
  PAYMENT_ISSUE: "bg-[#fbe9e9] text-red-600",
  PROCESSING: "bg-[#fdf0da] text-corisio-yellow",
  PENDING: "bg-neutral-100 text-neutral-600",
};

/** "Sep 10 - 3:30 PM" */
function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${day} - ${time}`;
}

export default function AttentionList({ items }: { items: AdminAttentionItem[] }) {
  return (
    <section aria-labelledby="attention-heading" className="rounded-3xl bg-white p-6 sm:p-8">
      <h2 id="attention-heading" className="text-lg font-semibold text-neutral-900">
        Needs your attention
      </h2>
      <p className="mt-1 text-sm text-neutral-500">Orders and issues that need immediate action.</p>

      {items.length === 0 ? (
        <motion.p
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 rounded-2xl bg-neutral-50 px-6 py-10 text-center text-sm text-neutral-500"
        >
          All clear. Nothing needs your attention right now.
        </motion.p>
      ) : (
        <ul className="mt-6">
          <AnimatePresence initial={false} mode="popLayout">
            {items.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.28 }}
                className="border-b border-neutral-100 last:border-b-0"
              >
                <Link
                  href={KIND_HREFS[item.kind]}
                  className="grid grid-cols-2 items-center gap-x-4 gap-y-2 rounded-xl px-1 py-4 transition hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-corisio-blue md:grid-cols-[1.1fr_1.5fr_1fr_1fr_auto]"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-neutral-900">{item.reference}</span>
                    <span className="block text-xs text-neutral-500">{formatWhen(item.createdAt)}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-neutral-900">
                      {item.customer.fullName}
                    </span>
                    <span className="block truncate text-xs text-neutral-500">{item.customer.email}</span>
                  </span>
                  <span className="text-sm font-medium text-neutral-900">{KIND_LABELS[item.kind]}</span>
                  <span
                    className={`text-sm ${item.amount === null ? "text-neutral-400" : "font-medium text-neutral-900"}`}
                  >
                    {item.amount === null ? "₦ (unconfirmed)" : formatNaira(item.amount)}
                  </span>
                  <span
                    className={`col-span-2 w-fit rounded-lg px-4 py-2 text-sm font-medium md:col-span-1 ${STATUS_STYLES[item.status]}`}
                  >
                    {STATUS_LABELS[item.status]}
                  </span>
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
