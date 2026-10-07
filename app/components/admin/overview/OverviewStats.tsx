"use client";

import { motion } from "framer-motion";
import { formatCount, getStatChange } from "@/app/components/admin/orders/formatters";
import { formatNaira } from "@/app/utils/product";
import type { AdminOrderStat, AdminOverviewStats } from "@/redux/types";
import AnimatedNumber from "./AnimatedNumber";
import { rise } from "./motion";

function Stat({
  stat,
  label,
  format,
}: {
  stat: AdminOrderStat;
  label: string;
  format: (n: number) => string;
}) {
  // The change is always against last month on this page
  const change = getStatChange(stat, "this_month");
  const [delta, ...rest] = (change?.text ?? "").split(" ");

  return (
    <motion.div variants={rise} className="flex-1 px-4 py-3 text-center sm:px-6">
      <p className="text-2xl font-bold text-neutral-900 sm:text-[28px]">
        <AnimatedNumber value={stat.value} format={format} />
      </p>
      <p className="mt-2 text-sm text-neutral-700">{label}</p>
      {change && (
        <p className="mt-2 flex items-center justify-center gap-1.5 text-xs">
          <span
            aria-hidden="true"
            className={`flex size-4 items-center justify-center rounded-full text-[10px] ${
              change.trend === "down" ? "bg-red-100 text-red-600" : "bg-corisio-100merald-100 text-emerald-600"
            }`}
          >
            {change.trend === "down" ? "↓" : "↑"}
          </span>
          <span className={`font-semibold ${change.trend === "down" ? "text-red-600" : "text-emerald-600"}`}>
            {delta}
          </span>
          <span className="text-neutral-400">{rest.join(" ")}</span>
        </p>
      )}
    </motion.div>
  );
}

export default function OverviewStats({ stats }: { stats: AdminOverviewStats }) {
  return (
    <div className="flex flex-1 flex-col divide-y divide-neutral-100 sm:flex-row sm:divide-x sm:divide-y-0">
      <Stat stat={stats.completedOrders} label="Completed Orders" format={formatCount} />
      <Stat stat={stats.totalSales} label="Total Sales" format={formatNaira} />
      <Stat stat={stats.activeCustomers} label="Active Customers" format={formatCount} />
      <Stat stat={stats.activeMemberships} label="Active Memberships" format={formatCount} />
    </div>
  );
}
