"use client";

import { useEffect, useState } from "react";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import AdminPageHeader from "@/app/components/admin/AdminPageHeader";
import { AdminToolbar } from "@/app/components/admin/AdminToolbar";
import { FilterSelect } from "@/app/components/admin/FilterSelect";
import { Pagination } from "@/app/components/admin/Pagination";
import { StatCard, StatCardRow } from "@/app/components/admin/StatCard";
import { MEMBERSHIP_STATUS_LABELS } from "@/app/components/admin/customers/formatters";
import {
  ACTIVE_STATUS_LABELS,
  ACTIVE_STATUS_OPTIONS,
  DELIVERY_FREQUENCY_LABELS,
  formatCompactNaira,
  formatNextDelivery,
  formatPercent,
  formatPlanPrice,
  formatRenewal,
  SUBSCRIPTION_STATUS_OPTIONS,
  type MembershipTab,
} from "@/app/components/admin/membership/formatters";
import { MembershipTabs } from "@/app/components/admin/membership/MembershipTabs";
import { PlanTable, useOpenPlanForm } from "@/app/components/admin/membership/PlanTable";
import { ProteinTable, useOpenProteinForm } from "@/app/components/admin/membership/ProteinTable";
import { SubscriberTable } from "@/app/components/admin/membership/SubscriberTable";
import { TableEmpty, TableError, TableSkeleton } from "@/app/components/admin/membership/TableStates";
import { csvCell, formatCount, getStatChange } from "@/app/components/admin/orders/formatters";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useGetAdminMembershipStatsQuery,
  useListAdminMembershipPlansQuery,
  useListAdminProteinsQuery,
  useListAdminSubscribersQuery,
} from "@/redux/slices/adminMembershipApi";
import type { AdminActiveStatus, AdminMembershipStat, AdminMembershipStatus } from "@/redux/types";

const DEFAULT_PER_PAGE = 10;
/** The stats on this page are always for the current month. */
const STATS_PERIOD = "this_month";

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function downloadCsv(filename: string, header: string[], rows: (string | number)[][]) {
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  notify.success("Export started", { message: "The list was downloaded as a CSV." });
}

const SEARCH_PLACEHOLDERS: Record<MembershipTab, string> = {
  overview: "Search plans......",
  subscribers: "Search by customer or plan......",
  proteins: "Search proteins......",
};

export default function MembershipClient() {
  const openPlanForm = useOpenPlanForm();
  const openProteinForm = useOpenProteinForm();

  const [tab, setTab] = useState<MembershipTab>("overview");
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<AdminActiveStatus | "">("");
  const [subscriptionStatus, setSubscriptionStatus] = useState<AdminMembershipStatus | "">("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const debouncedSearch = useDebouncedValue(search.trim(), 350);
  const hasFilters =
    !!debouncedSearch || (tab === "subscribers" ? !!subscriptionStatus : !!activeStatus);

  const stats = useGetAdminMembershipStatsQuery();
  const plans = useListAdminMembershipPlansQuery(
    { search: debouncedSearch || undefined, status: activeStatus || undefined },
    { skip: tab !== "overview" },
  );
  const subscribers = useListAdminSubscribersQuery(
    {
      search: debouncedSearch || undefined,
      status: subscriptionStatus || undefined,
      page,
      perPage,
    },
    { skip: tab !== "subscribers" },
  );
  const proteins = useListAdminProteinsQuery(
    { search: debouncedSearch || undefined, status: activeStatus || undefined },
    { skip: tab !== "proteins" },
  );

  const s = stats.data?.data;
  const statsLoading = stats.currentData === undefined && stats.isFetching;
  const planItems = plans.currentData?.data.items;
  const subscriberList = subscribers.currentData?.data;
  const proteinItems = proteins.currentData?.data.items;

  function handleTabChange(next: MembershipTab) {
    setTab(next);
    setSearch("");
    setActiveStatus("");
    setSubscriptionStatus("");
    setPage(1);
  }

  function statCard(label: string, stat: AdminMembershipStat | undefined, money = false) {
    const change = stat ? getStatChange(stat, STATS_PERIOD) : undefined;
    return (
      <StatCard
        loading={statsLoading}
        value={stat ? (money ? formatCompactNaira(stat.value) : formatCount(stat.value)) : "-"}
        label={label}
        change={change?.text}
        trend={change?.trend}
      />
    );
  }

  const exportDisabled =
    tab === "overview"
      ? !planItems?.length
      : tab === "subscribers"
        ? !subscriberList?.items.length
        : !proteinItems?.length;

  function handleExport() {
    if (tab === "overview" && planItems?.length) {
      downloadCsv(
        "luxol-membership-plans.csv",
        ["Plan", "Price", "Members", "Monthly Revenue (NGN)", "Delivery", "Status"],
        planItems.map((p) => [
          p.name,
          formatPlanPrice(p.price, p.interval),
          p.membersCount,
          p.monthlyRevenue,
          DELIVERY_FREQUENCY_LABELS[p.deliveryFrequency],
          ACTIVE_STATUS_LABELS[p.status],
        ]),
      );
    } else if (tab === "subscribers" && subscriberList?.items.length) {
      downloadCsv(
        `luxol-subscribers-page-${page}.csv`,
        ["Customer", "Membership", "Billing", "Next Delivery", "Renewal", "Status"],
        subscriberList.items.map((x) => [
          x.customer.fullName,
          x.planName,
          formatPlanPrice(x.price, x.interval),
          formatNextDelivery(x.nextDeliveryAt, x.nextDeliverySlot),
          formatRenewal(x.renewalAt),
          MEMBERSHIP_STATUS_LABELS[x.status],
        ]),
      );
    } else if (tab === "proteins" && proteinItems?.length) {
      downloadCsv(
        "luxol-proteins.csv",
        ["Protein", "Description", "Sold This Month", "Status"],
        proteinItems.map((p) => [
          p.label,
          p.description,
          formatPercent(p.soldPercentage),
          ACTIVE_STATUS_LABELS[p.status],
        ]),
      );
    }
  }

  const headerAction =
    tab === "overview" ? (
      <AddButton label="New Plan" onClick={() => openPlanForm()} />
    ) : tab === "proteins" ? (
      <AddButton label="Add Protein" onClick={() => openProteinForm()} />
    ) : undefined;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Membership"
        description="Manage membership plans, subscribers, recurring payments and scheduled protein deliveries."
        actions={headerAction}
      />

      <StatCardRow>
        {statCard("Active Members", s?.activeMembers)}
        {statCard("Monthly Recurring Revenue", s?.monthlyRecurringRevenue, true)}
        {statCard("Upcoming Deliveries", s?.upcomingDeliveries)}
        {statCard("Renewals Due", s?.renewalsDue)}
        {statCard("Needs Attention", s?.needsAttention)}
      </StatCardRow>

      <div className="rounded-2xl border border-neutral-100 bg-white p-5 sm:p-6">
        <AdminToolbar
          leading={<MembershipTabs value={tab} onChange={handleTabChange} />}
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder={SEARCH_PLACEHOLDERS[tab]}
          extra={
            tab === "subscribers" ? (
              <FilterSelect
                ariaLabel="Filter by status"
                allLabel="All statuses"
                value={subscriptionStatus}
                onChange={(v) => {
                  setSubscriptionStatus(v);
                  setPage(1);
                }}
                options={SUBSCRIPTION_STATUS_OPTIONS}
              />
            ) : (
              <FilterSelect
                ariaLabel="Filter by status"
                allLabel="All statuses"
                value={activeStatus}
                onChange={setActiveStatus}
                options={ACTIVE_STATUS_OPTIONS}
              />
            )
          }
          onExport={handleExport}
          exportDisabled={exportDisabled}
        />
      </div>

      <div className="rounded-2xl border border-neutral-100 bg-white p-5 sm:p-6">
        {tab === "overview" &&
          (plans.currentData === undefined && plans.isFetching ? (
            <TableSkeleton rows={4} />
          ) : plans.isError ? (
            <TableError message={getErrorMessage(plans.error)} onRetry={plans.refetch} />
          ) : !planItems?.length ? (
            <TableEmpty
              icon="package"
              title={hasFilters ? "No plans match your search" : "No membership plans yet"}
              description={
                hasFilters
                  ? "Try a different name or status."
                  : "Create your first plan so customers can subscribe."
              }
              actionLabel={hasFilters ? undefined : "New Plan"}
              onAction={() => openPlanForm()}
            />
          ) : (
            <PlanTable plans={planItems} />
          ))}

        {tab === "subscribers" &&
          (subscribers.currentData === undefined && subscribers.isFetching ? (
            <TableSkeleton rows={perPage > 12 ? 12 : perPage} />
          ) : subscribers.isError ? (
            <TableError message={getErrorMessage(subscribers.error)} onRetry={subscribers.refetch} />
          ) : !subscriberList?.items.length ? (
            <TableEmpty
              icon="customers"
              title={hasFilters ? "No subscribers match your search" : "No subscribers yet"}
              description={
                hasFilters
                  ? "Try a different customer, plan or status."
                  : "Customers who subscribe to a plan will show up here."
              }
            />
          ) : (
            <>
              <SubscriberTable subscribers={subscriberList.items} />
              <Pagination
                page={subscriberList.page}
                perPage={subscriberList.perPage}
                total={subscriberList.total}
                onPageChange={setPage}
                onPerPageChange={(n) => {
                  setPerPage(n);
                  setPage(1);
                }}
              />
            </>
          ))}

        {tab === "proteins" &&
          (proteins.currentData === undefined && proteins.isFetching ? (
            <TableSkeleton rows={4} />
          ) : proteins.isError ? (
            <TableError message={getErrorMessage(proteins.error)} onRetry={proteins.refetch} />
          ) : !proteinItems?.length ? (
            <TableEmpty
              icon="package"
              title={hasFilters ? "No proteins match your search" : "No proteins yet"}
              description={
                hasFilters
                  ? "Try a different name or status."
                  : "Add the proteins members can mix into their deliveries, like chicken or beef."
              }
              actionLabel={hasFilters ? undefined : "Add Protein"}
              onAction={() => openProteinForm()}
            />
          ) : (
            <ProteinTable proteins={proteinItems} />
          ))}
      </div>
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 items-center gap-2 rounded-xl bg-corisio-blue px-4 text-sm font-medium text-white transition hover:brightness-110"
    >
      <AdminIcon name="plus" className="size-4" />
      {label}
    </button>
  );
}
