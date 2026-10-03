"use client";

import { useMemo, useState } from "react";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import AdminPageHeader from "@/app/components/admin/AdminPageHeader";
import { AdminToolbar } from "@/app/components/admin/AdminToolbar";
import { Pagination } from "@/app/components/admin/Pagination";
import { StatCard, StatCardRow } from "@/app/components/admin/StatCard";
import { formatNaira } from "@/app/utils/product";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useGetPromotionStatsQuery, useListPromotionsQuery } from "@/redux/slices/promotionsApi";
import { PromotionFormDialog } from "@/app/components/admin/promotions/PromotionFormDialog";
import { PromotionTable, PromotionTableSkeleton } from "@/app/components/admin/promotions/PromotionTable";
import { formatAppliesTo, formatDiscount } from "@/app/components/admin/promotions/formatters";

const DEFAULT_PER_PAGE = 9;

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useMemo(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return debounced;
}

export default function PromotionsPage() {
  const { openDialog } = useDialog();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const debouncedSearch = useDebouncedValue(search, 350);

  const stats = useGetPromotionStatsQuery();
  const promotions = useListPromotionsQuery({
    search: debouncedSearch || undefined,
    page,
    perPage,
  });

  const s = stats.data?.data;
  const list = promotions.data?.data;

  function handleCreate() {
    openDialog(({ close }) => <PromotionFormDialog close={close} />, {
      title: "Create Promotion",
      side: "center",
      width: "xl",
    });
  }

  function handleExport() {
    if (!list || list.items.length === 0) return;

    const header = ["Name", "Type", "Applies To", "Discount", "Start", "End", "Status"];
    const rows = list.items.map((p) => [
      p.name,
      p.type,
      formatAppliesTo(p),
      formatDiscount(p),
      p.startAt,
      p.endAt ?? "",
      p.status,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell?.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `luxol-promotions-page-${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify.success("Export started", { message: "This page's promotions were downloaded as a CSV." });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Promotions"
        description="Create and manage special offers, discounts and campaigns across Luxol."
        actions={
          <button
            type="button"
            onClick={handleCreate}
            className="flex h-11 items-center gap-2 rounded-xl bg-corisio-blue px-4 text-sm font-medium text-white transition hover:brightness-110"
          >
            <AdminIcon name="plus" className="size-4" />
            Create Promotion
          </button>
        }
      />

      <StatCardRow>
        <StatCard
          loading={stats.isLoading}
          value={s ? String(s.activePromotions.value) : "-"}
          label="Active Promotions"
          change={
            s?.activePromotions.changePercent !== undefined
              ? `${s.activePromotions.changePercent}% this month`
              : undefined
          }
        />
        <StatCard
          loading={stats.isLoading}
          value={s ? String(s.scheduled.value) : "-"}
          label="Scheduled"
          change={s?.scheduled.change !== undefined ? `${s.scheduled.change} this month` : undefined}
        />
        <StatCard
          loading={stats.isLoading}
          value={s ? String(s.productsOnPromotion.value) : "-"}
          label="Products on Promotion"
          change={
            s?.productsOnPromotion.changePercent !== undefined
              ? `${s.productsOnPromotion.changePercent}% this month`
              : undefined
          }
        />
        <StatCard
          loading={stats.isLoading}
          value={s ? formatNaira(s.promotionSales.value) : "-"}
          label="Promotion Sales"
          change={
            s?.promotionSales.change !== undefined ? `${s.promotionSales.change} this month` : undefined
          }
        />
      </StatCardRow>

      <div className="rounded-2xl border border-neutral-100 bg-white p-5 sm:p-6">
        <AdminToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onExport={handleExport}
          exportDisabled={!list || list.items.length === 0}
        />
      </div>

      <div className="rounded-2xl border border-neutral-100 bg-white p-5 sm:p-6">
        {promotions.isLoading ? (
          <PromotionTableSkeleton />
        ) : promotions.isError ? (
          <ErrorState message={getErrorMessage(promotions.error)} onRetry={promotions.refetch} />
        ) : !list || list.items.length === 0 ? (
          <EmptyState hasSearch={!!debouncedSearch} onCreate={handleCreate} />
        ) : (
          <>
            <PromotionTable promotions={list.items} />
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

function EmptyState({ hasSearch, onCreate }: { hasSearch: boolean; onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        <AdminIcon name="package" className="size-7" />
      </span>
      <p className="text-sm font-medium text-neutral-900">
        {hasSearch ? "No promotions match your search" : "No promotions yet"}
      </p>
      <p className="max-w-sm text-sm text-neutral-500">
        {hasSearch
          ? "Try a different name or code."
          : "Create your first promotion to start running offers across Luxol."}
      </p>
      {!hasSearch && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-2 rounded-lg bg-corisio-blue px-4 py-2 text-sm font-medium text-white hover:brightness-110"
        >
          Create Promotion
        </button>
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-sm text-neutral-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
      >
        Try again
      </button>
    </div>
  );
}
