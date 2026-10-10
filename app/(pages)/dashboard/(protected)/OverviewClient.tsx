"use client";

import { MotionConfig, motion } from "framer-motion";
import AdminPageHeader from "@/app/components/admin/AdminPageHeader";
import AttentionList from "@/app/components/admin/overview/AttentionList";
import ModuleCards from "@/app/components/admin/overview/ModuleCards";
import { rise, stagger } from "@/app/components/admin/overview/motion";
import OrderActivityCard from "@/app/components/admin/overview/OrderActivityCard";
import OrderStatusChart from "@/app/components/admin/overview/OrderStatusChart";
import OverviewSkeleton from "@/app/components/admin/overview/OverviewSkeleton";
import OverviewStats from "@/app/components/admin/overview/OverviewStats";
import SalesTrendChart from "@/app/components/admin/overview/SalesTrendChart";
import TopProducts from "@/app/components/admin/overview/TopProducts";
import { getErrorMessage } from "@/redux/config/errors";
import { useGetAdminOverviewQuery } from "@/redux/slices/adminOverviewApi";
import type { AdminOverview } from "@/redux/types";

/** New orders land all day: refresh quietly while the tab is in view. */
const POLL = { pollingInterval: 60_000, skipPollingIfUnfocused: true } as const;

export default function OverviewClient() {
  const { data, isError, error, refetch } = useGetAdminOverviewQuery(undefined, POLL);
  const overview = data?.data;

  return (
    // "user": people who ask their OS for less motion get fades only, no movement
    <MotionConfig reducedMotion="user">
      <div className="space-y-6">
        <AdminPageHeader
          title="Business Overview"
          description="Here's a quick look at how your store is performing today."
        />

        {overview ? (
          <Dashboard overview={overview} />
        ) : isError ? (
          <div role="alert" className="rounded-3xl bg-white px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-neutral-900">We couldn&apos;t load the overview</h2>
            <p className="mt-2 text-sm text-neutral-500">{getErrorMessage(error)}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-6 h-11 rounded-lg bg-corisio-blue px-5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Try again
            </button>
          </div>
        ) : (
          <OverviewSkeleton />
        )}
      </div>
    </MotionConfig>
  );
}

/**
 * Mounts once the data is in, so the stagger plays on arrival. Later refetches
 * keep it mounted: numbers ease to their new values and list rows animate in/out.
 */
function Dashboard({ overview }: { overview: AdminOverview }) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.section
        variants={rise}
        aria-label="This week at a glance"
        className="flex flex-col divide-y divide-neutral-100 rounded-3xl bg-white p-6 lg:flex-row lg:divide-x lg:divide-y-0 lg:p-8"
      >
        <OrderActivityCard week={overview.week} />
        <OverviewStats stats={overview.stats} />
      </motion.section>

      <motion.div
        variants={rise}
        className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]"
      >
        <SalesTrendChart points={overview.salesTrend ?? []} />
        <OrderStatusChart items={overview.ordersByStatus ?? []} />
      </motion.div>

      <ModuleCards modules={overview.modules} />

      <motion.div
        variants={rise}
        className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]"
      >
        <AttentionList items={overview.attention} />
        <TopProducts />
      </motion.div>
    </motion.div>
  );
}
