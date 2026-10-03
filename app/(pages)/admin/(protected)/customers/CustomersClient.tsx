"use client";

import { useEffect, useState } from "react";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import AdminPageHeader from "@/app/components/admin/AdminPageHeader";
import { AdminToolbar } from "@/app/components/admin/AdminToolbar";
import { Pagination } from "@/app/components/admin/Pagination";
import { StatCard, StatCardRow } from "@/app/components/admin/StatCard";
import { CustomerStatusSelect } from "@/app/components/admin/customers/CustomerStatusSelect";
import { CustomerTable, CustomerTableSkeleton } from "@/app/components/admin/customers/CustomerTable";
import { CUSTOMER_STATUS_LABELS, formatDate } from "@/app/components/admin/customers/formatters";
import { PeriodSelect } from "@/app/components/admin/orders/OrderSelects";
import { csvCell, formatCount, getStatChange } from "@/app/components/admin/orders/formatters";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useGetAdminCustomerStatsQuery, useListAdminCustomersQuery } from "@/redux/slices/adminCustomersApi";
import type { AdminCustomerPeriod, AdminCustomerStat, AdminCustomerStatus } from "@/redux/types";

const DEFAULT_PER_PAGE = 8;

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export default function CustomersClient() {
  const [period, setPeriod] = useState<AdminCustomerPeriod>("this_month");
  const [status, setStatus] = useState<AdminCustomerStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const debouncedSearch = useDebouncedValue(search.trim(), 350);

  const stats = useGetAdminCustomerStatsQuery({ period });
  const customers = useListAdminCustomersQuery({
    period,
    status: status || undefined,
    search: debouncedSearch || undefined,
    page,
    perPage,
  });

  const s = stats.data?.data;
  const statsLoading = stats.currentData === undefined && stats.isFetching;
  const list = customers.currentData?.data;
  const listLoading = customers.currentData === undefined && customers.isFetching;
  const hasFilters = !!debouncedSearch || !!status;

  function statCard(label: string, stat: AdminCustomerStat | undefined) {
    const change = stat ? getStatChange(stat, period) : undefined;
    return (
      <StatCard
        loading={statsLoading}
        value={stat ? formatCount(stat.value) : "-"}
        label={label}
        change={change?.text}
        trend={change?.trend}
      />
    );
  }

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  function handleExport() {
    if (!list || list.items.length === 0) return;

    const header = ["Name", "Email", "Phone", "Orders", "Total Spent (NGN)", "Membership", "Last Order", "Status"];
    const rows = list.items.map((c) => [
      c.fullName,
      c.email,
      c.phone,
      c.ordersCount,
      c.totalSpent,
      c.membership ?? "",
      c.lastOrderAt ? formatDate(c.lastOrderAt) : "",
      CUSTOMER_STATUS_LABELS[c.status],
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `luxol-customers-page-${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify.success("Export started", { message: "This page's customers were downloaded as a CSV." });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customers"
        description="Manage customer accounts, orders, memberships and shopping activity."
        actions={<PeriodSelect value={period} onChange={resetPage(setPeriod)} />}
      />

      <StatCardRow>
        {statCard("Total Customers", s?.totalCustomers)}
        {statCard("New Customers", s?.newCustomers)}
        {statCard("Active Customers", s?.activeCustomers)}
        {statCard("Members", s?.members)}
      </StatCardRow>

      <div className="rounded-2xl border border-neutral-100 bg-white p-5 sm:p-6">
        <AdminToolbar
          search={search}
          onSearchChange={resetPage(setSearch)}
          placeholder="Search by name, email or phone......"
          extra={<CustomerStatusSelect value={status} onChange={resetPage(setStatus)} />}
          onExport={handleExport}
          exportDisabled={!list || list.items.length === 0}
        />
      </div>

      <div className="rounded-2xl border border-neutral-100 bg-white p-5 sm:p-6">
        {listLoading ? (
          <CustomerTableSkeleton rows={perPage > 12 ? 12 : perPage} />
        ) : customers.isError ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-neutral-600">{getErrorMessage(customers.error)}</p>
            <button
              type="button"
              onClick={customers.refetch}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
            >
              Try again
            </button>
          </div>
        ) : !list || list.items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
              <AdminIcon name="customers" className="size-7" />
            </span>
            <p className="text-sm font-medium text-neutral-900">
              {hasFilters ? "No customers match your search" : "No customers yet"}
            </p>
            <p className="max-w-sm text-sm text-neutral-500">
              {hasFilters
                ? "Try a different name, email, phone number or status."
                : "Customers who sign up will show up here."}
            </p>
          </div>
        ) : (
          <>
            <CustomerTable customers={list.items} />
            <Pagination
              page={list.page}
              perPage={list.perPage}
              total={list.total}
              onPageChange={setPage}
              onPerPageChange={(n) => {
                setPerPage(n);
                setPage(1);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
