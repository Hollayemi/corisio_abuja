"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import AdminIcon, { type AdminIconName } from "@/app/components/admin/layout/AdminIcon";
import { formatCount } from "@/app/components/admin/orders/formatters";
import { formatNaira } from "@/app/utils/product";
import type { AdminOverviewModules } from "@/redux/types";
import AnimatedNumber from "./AnimatedNumber";
import { rise, stagger } from "./motion";

/* Full class names per card so Tailwind can see them */
const TONES = {
  red: { tile: "bg-[#fbe4e4] text-[#c0392b]", footer: "bg-[#fdf0f0]", icon: "text-[#c0392b]" },
  teal: { tile: "bg-[#d9f1ec] text-[#1f9e89]", footer: "bg-[#e6f6f2]", icon: "text-[#1f9e89]" },
  purple: { tile: "bg-[#e6e0fa] text-[#6c4fd6]", footer: "bg-[#efeafc]", icon: "text-[#6c4fd6]" },
  orange: { tile: "bg-[#fdebd0] text-[#e0861a]", footer: "bg-[#fdf3e3]", icon: "text-[#e0861a]" },
} as const;

type Tone = keyof typeof TONES;

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 12a8 8 0 0 1-14 5.3" />
      <path d="M4 12a8 8 0 0 1 14-5.3" />
      <path d="M18 3v4h-4" />
      <path d="M6 21v-4h4" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 3.5 2.5 20h19z" />
      <path d="M12 10v4.5" />
      <circle cx="12" cy="17.2" r=".6" fill="currentColor" />
    </svg>
  );
}

type Metric = { value: number; label: string };

function ModuleCard({
  tone,
  icon,
  title,
  subtitle,
  metrics,
  footerIcon,
  caption,
  headline,
  href,
  format = formatCount,
  headlineValue,
}: {
  tone: Tone;
  icon: AdminIconName;
  title: string;
  subtitle: string;
  metrics: Metric[];
  footerIcon: React.ReactNode;
  caption: string;
  /** Text under the caption when it is not a number. */
  headline?: string;
  href: string;
  format?: (n: number) => string;
  /** Pass instead of `headline` for a number that counts up (e.g. revenue). */
  headlineValue?: number;
}) {
  const t = TONES[tone];

  return (
    <motion.div
      variants={rise}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className="flex flex-col rounded-3xl bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.03)] hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        <span className={`flex size-[60px] shrink-0 items-center justify-center rounded-2xl ${t.tile}`}>
          <AdminIcon name={icon} className="size-7" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          <p className="truncate text-sm text-neutral-500">{subtitle}</p>
        </div>
      </div>

      <dl className="mt-8 flex justify-between gap-3">
        {metrics.map((m) => (
          <div key={m.label}>
            <dd className="text-xl font-semibold text-neutral-900">
              <AnimatedNumber value={m.value} format={formatCount} />
            </dd>
            <dt className="mt-1 text-sm text-neutral-500">{m.label}</dt>
          </div>
        ))}
      </dl>

      <motion.div initial="rest" animate="rest" whileHover="hover" className="mt-6">
        <Link
          href={href}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue ${t.footer}`}
        >
          <span className={t.icon}>{footerIcon}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-neutral-500">{caption}</span>
            <span className="block truncate text-sm font-semibold text-neutral-900">
              {headlineValue !== undefined ? (
                <AnimatedNumber value={headlineValue} format={format} />
              ) : (
                headline
              )}
            </span>
          </span>
          <motion.span variants={{ rest: { x: 0 }, hover: { x: 4 } }} className="text-neutral-800">
            <AdminIcon name="chevronRight" className="size-4" />
          </motion.span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function ModuleCards({ modules }: { modules: AdminOverviewModules }) {
  const { meatBox, freezerPlanner, membership, inventory } = modules;

  return (
    <motion.div variants={stagger} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <ModuleCard
        tone="red"
        icon="meatBox"
        title="Meat Box"
        subtitle="Bulk meat orders with custom preparations"
        metrics={[
          { value: meatBox.activeOrders, label: "Active Orders" },
          { value: meatBox.preparing, label: "Preparing" },
          { value: meatBox.awaitingWeight, label: "Awaiting weight" },
        ]}
        footerIcon={<AdminIcon name="package" className="size-6" />}
        caption="Next delivery window"
        headline={meatBox.nextDeliveryWindow ?? "Nothing scheduled"}
        href="/dashboard/orders"
      />
      <ModuleCard
        tone="teal"
        icon="freezerPlanner"
        title="Freezer Planner"
        subtitle="Complete freezer shopping plans"
        metrics={[
          { value: freezerPlanner.activeOrders, label: "Active Orders" },
          { value: freezerPlanner.processing, label: "Processing" },
          { value: freezerPlanner.recurring, label: "Recurring" },
        ]}
        footerIcon={<AdminIcon name="freezerPlanner" className="size-6" />}
        caption="Next delivery window"
        headline={freezerPlanner.nextDeliveryWindow ?? "Nothing scheduled"}
        href="/dashboard/orders"
      />
      <ModuleCard
        tone="purple"
        icon="membership"
        title="Membership"
        subtitle="Monitor your active membership here"
        metrics={[
          { value: membership.activeMembers, label: "Active Members" },
          { value: membership.newMembers, label: "New Members" },
          { value: membership.renewals, label: "Renewal" },
        ]}
        footerIcon={<RefreshIcon className="size-6" />}
        caption="Expected recurring revenue"
        headlineValue={membership.expectedRecurringRevenue}
        format={formatNaira}
        href="/dashboard/membership"
      />
      <ModuleCard
        tone="orange"
        icon="package"
        title="Inventory"
        subtitle="Track stock levels and get low-stock alerts"
        metrics={[
          { value: inventory.lowStock, label: "Low Stock" },
          { value: inventory.outOfStock, label: "Out of Stock" },
          { value: inventory.runningLow, label: "Running Low" },
        ]}
        footerIcon={<WarningIcon className="size-6" />}
        caption="Immediate attention"
        headline={
          inventory.immediateAttention > 0
            ? `${formatCount(inventory.immediateAttention)} ${
                inventory.immediateAttention === 1 ? "item needs" : "items need"
              } immediate attention`
            : "Stock levels look healthy"
        }
        href="/dashboard/inventory"
      />
    </motion.div>
  );
}
