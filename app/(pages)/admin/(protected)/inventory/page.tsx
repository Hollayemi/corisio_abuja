"use client";

import { useMemo, useState } from "react";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import AdminPageHeader from "@/app/components/admin/AdminPageHeader";
import { Pagination } from "@/app/components/admin/Pagination";
import { StatCard, StatCardRow } from "@/app/components/admin/StatCard";
import { CategoryListDialog } from "@/app/components/admin/inventory/CategoryListDialog";
import { InventoryToolbar } from "@/app/components/admin/inventory/InventoryToolbar";
import { ProductFormDialog } from "@/app/components/admin/inventory/ProductFormDialog";
import { ProductTable, ProductTableSkeleton } from "@/app/components/admin/inventory/ProductTable";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useGetInventoryStatsQuery, useListProductsQuery } from "@/redux/slices/inventoryApi";

const DEFAULT_PER_PAGE = 8;

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useMemo(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return debounced;
}

export default function InventoryPage() {
  const { openDialog } = useDialog();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const debouncedSearch = useDebouncedValue(search, 350);

  const stats = useGetInventoryStatsQuery();
  const products = useListProductsQuery({
    search: debouncedSearch || undefined,
    page,
    perPage,
  });

  const s = stats.data?.data;
  const list = products.data?.data;

  console.log({list})

  function handleAddCategory() {
    openDialog(({ close }) => <CategoryListDialog close={close} />, {
      title: "Product Categories",
      side: "center",
      width: "xl",
    });
  }

  function handleAddProduct() {
    openDialog(({ close }) => <ProductFormDialog close={close} />, {
      title: "Add Product",
      side: "center",
      width: "2xl",
    });
  }

  function handleExport() {
    if (!list || list.items.length === 0) return;

    const header = ["Product ID", "Name", "Category", "SKU", "Unit Price", "Stock", "Reorder Level", "Status"];
    const rows = list.items.map((p:any) => [
      p.productId,
      p.name,
      p.category.name,
      p.sku,
      String(p.unitPrice),
      String(p.stock),
      String(p.reorderLevel),
      p.stockStatus,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell: any) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `luxol-inventory-page-${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify.success("Export started", { message: "This page's products were downloaded as a CSV." });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Inventory"
        description="Track stock levels, availability and inventory activity across Luxol."
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddCategory}
              className="flex h-11 items-center gap-2 rounded-xl border border-neutral-300 px-4 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              <AdminIcon name="plus" className="size-4" />
              Add Category
            </button>
            <button
              type="button"
              onClick={handleAddProduct}
              className="flex h-11 items-center gap-2 rounded-xl bg-corisio-blue px-4 text-sm font-medium text-white transition hover:brightness-110"
            >
              <AdminIcon name="plus" className="size-4" />
              Add Product
            </button>
          </div>
        }
      />

      <StatCardRow>
        <StatCard
          loading={stats.isLoading}
          value={s ? String(s.totalProducts.value) : "-"}
          label="Total Products"
          change={
            s?.totalProducts.changePercent !== undefined
              ? `${s.totalProducts.changePercent}% this month`
              : undefined
          }
        />
        <StatCard
          loading={stats.isLoading}
          value={s ? String(s.inStock.value) : "-"}
          label="In Stock"
          change={s?.inStock.change !== undefined ? `${s.inStock.change} this month` : undefined}
        />
        <StatCard
          loading={stats.isLoading}
          value={s ? String(s.lowStock.value) : "-"}
          label="Low Stock"
          change={
            s?.lowStock.changePercent !== undefined ? `${s.lowStock.changePercent}% this month` : undefined
          }
        />
        <StatCard
          loading={stats.isLoading}
          value={s ? String(s.outOfStock.value) : "-"}
          label="Out of Stock"
          change={s?.outOfStock.change !== undefined ? `${s.outOfStock.change} this month` : undefined}
        />
      </StatCardRow>

      <div className="rounded-2xl border border-neutral-100 bg-white p-5 sm:p-6">
        <InventoryToolbar
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
        {products.isLoading ? (
          <ProductTableSkeleton />
        ) : products.isError ? (
          <ErrorState message={getErrorMessage(products.error)} onRetry={products.refetch} />
        ) : !list || list.items.length === 0 ? (
          <EmptyState hasSearch={!!debouncedSearch} onAddProduct={handleAddProduct} />
        ) : (
          <>
            <ProductTable products={list.items} />
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

function EmptyState({
  hasSearch,
  onAddProduct,
}: {
  hasSearch: boolean;
  onAddProduct: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        <AdminIcon name="package" className="size-7" />
      </span>
      <p className="text-sm font-medium text-neutral-900">
        {hasSearch ? "No products match your search" : "No products yet"}
      </p>
      <p className="max-w-sm text-sm text-neutral-500">
        {hasSearch
          ? "Try a different name or SKU."
          : "Add your first product to start tracking stock across Luxol."}
      </p>
      {!hasSearch && (
        <button
          type="button"
          onClick={onAddProduct}
          className="mt-2 rounded-lg bg-corisio-blue px-4 py-2 text-sm font-medium text-white hover:brightness-110"
        >
          Add Product
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
