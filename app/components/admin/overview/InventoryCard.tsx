"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { formatCount } from "@/app/components/admin/orders/formatters";
import type { AdminOverviewInventory } from "@/redux/types";
import AnimatedNumber from "./AnimatedNumber";
import { rise } from "./motion";

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 3.5 2.5 20h19z" />
      <path d="M12 10v4.5" />
      <circle cx="12" cy="17.2" r=".6" fill="currentColor" />
    </svg>
  );
}

/** Stock health at a glance, with a link straight to the items that need action. */
export default function InventoryCard({ inventory }: { inventory: AdminOverviewInventory }) {
  const metrics = [
    { value: inventory.lowStock, label: "Low Stock" },
    { value: inventory.outOfStock, label: "Out of Stock" },
    { value: inventory.runningLow, label: "Running Low" },
  ];
  const attention = inventory.immediateAttention;

  return (
    <motion.section
      variants={rise}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      aria-labelledby="inventory-heading"
      className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.03)] hover:shadow-md sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10"
    >
      <div className="flex items-center gap-4">
        <span className="flex size-[60px] shrink-0 items-center justify-center rounded-2xl bg-[#fdebd0] text-[#e0861a]">
          <AdminIcon name="package" className="size-7" />
        </span>
        <div className="min-w-0">
          <h2 id="inventory-heading" className="text-lg font-semibold text-neutral-900">
            Inventory
          </h2>
          <p className="text-sm text-neutral-500">Track stock levels and get low-stock alerts</p>
        </div>
      </div>

      <dl className="flex gap-8 sm:gap-12">
        {metrics.map((m) => (
          <div key={m.label}>
            <dd className="text-xl font-semibold text-neutral-900">
              <AnimatedNumber value={m.value} format={formatCount} />
            </dd>
            <dt className="mt-1 text-sm text-neutral-500">{m.label}</dt>
          </div>
        ))}
      </dl>

      <motion.div initial="rest" animate="rest" whileHover="hover" className="lg:w-[320px]">
        <Link
          href="/dashboard/inventory"
          className="flex items-center gap-3 rounded-xl bg-[#fdf3e3] px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
        >
          <span className="text-[#e0861a]">
            <WarningIcon className="size-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-neutral-500">Immediate attention</span>
            <span className="block truncate text-sm font-semibold text-neutral-900">
              {attention > 0
                ? `${formatCount(attention)} ${attention === 1 ? "item needs" : "items need"} immediate attention`
                : "Stock levels look healthy"}
            </span>
          </span>
          <motion.span variants={{ rest: { x: 0 }, hover: { x: 4 } }} className="text-neutral-800">
            <AdminIcon name="chevronRight" className="size-4" />
          </motion.span>
        </Link>
      </motion.div>
    </motion.section>
  );
}
