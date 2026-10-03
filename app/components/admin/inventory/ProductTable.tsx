"use client";

import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { ActionMenu } from "@/app/components/admin/ActionMenu";
import { ConfirmDialog } from "@/app/components/admin/ConfirmDialog";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import { notify } from "@/lib/notify";
import { formatNaira } from "@/app/utils/product";
import { getErrorMessage } from "@/redux/config/errors";
import { useDeleteProductMutation } from "@/redux/slices/inventoryApi";
import type { Product } from "@/redux/types";
import { StockStatusPill } from "./StatusPill";
import { ProductFormDialog } from "./ProductFormDialog";

const COLUMNS = [
  "Product Name",
  "Category & SKU",
  "Unit Price",
  "Stock",
  "Reorder Level",
  "Last Updated",
  "Status",
  "",
];

function formatUpdatedAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  const datePart = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const timePart = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${datePart} · ${timePart}`;
}

function ProductRow({ product }: { product: Product }) {
  const { openDialog } = useDialog();
  const [deleteProduct] = useDeleteProductMutation();

  function handleEdit() {
    openDialog(({ close }) => <ProductFormDialog product={product} close={close} />, {
      title: "Edit Product",
      side: "center",
      width: "2xl",
    });
  }

  function handleDelete() {
    openDialog(
      ({ close }) => (
        <ConfirmDialog
          title="Delete this product?"
          description={`"${product.name}" will be removed from the catalog. This can't be undone.`}
          onConfirm={async () => {
            try {
              await deleteProduct(product.id).unwrap();
              notify.success("Product deleted");
            } catch (err) {
              notify.error("Couldn't delete product", { message: getErrorMessage(err) });
              throw err;
            }
          }}
          close={close}
        />
      ),
      { title: "Delete product", side: "center", width: "sm" },
    );
  }

  return (
    <tr className="border-b border-neutral-100 last:border-0">
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
            {product.images ? (
              // Product photos come from wherever the backend stores uploads,
              // so this can't go through next/image's fixed remote-pattern allowlist.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[0]} alt="" className="size-full object-cover" />
            ) : (
              <AdminIcon name="package" className="size-4 text-neutral-400" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-neutral-900">{product.name}</p>
            <p className="text-xs text-neutral-400">{product.productId}</p>
          </div>
        </div>
      </td>
      <td className="py-4 pr-4">
        <p className="text-sm text-neutral-900">{product.category.name}</p>
        <p className="text-xs text-neutral-400">{product.sku}</p>
      </td>
      <td className="py-4 pr-4 text-sm text-neutral-900">
        {formatNaira(product.unitPrice)}/{product.unitType}
      </td>
      <td className="py-4 pr-4 text-sm text-neutral-900">
        {product.stock} {product.unitType}
      </td>
      <td className="py-4 pr-4 text-sm text-neutral-900">
        {product.reorderLevel} {product.unitType}
      </td>
      <td className="py-4 pr-4 text-sm text-neutral-500">{formatUpdatedAt(product.updatedAt)}</td>
      <td className="py-4 pr-4">
        <StockStatusPill status={product.status} />
      </td>
      <td className="py-4">
        <ActionMenu
          items={[
            { label: "Edit", onClick: handleEdit, icon: <AdminIcon name="edit" className="size-4" /> },
            {
              label: "Delete",
              onClick: handleDelete,
              icon: <AdminIcon name="trash" className="size-4" />,
              destructive: true,
            },
          ]}
        />
      </td>
    </tr>
  );
}

export function ProductTable({ products }: { products: Product[] }) {
  console.log(products)
  return (
    <div className="overflow-x-auto pb-21">
      <table className="w-full min-w-[860px] text-left">
        <thead>
          <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-400">
            {COLUMNS.map((col) => (
              <th key={col} className="pb-3 pr-4 font-normal first:pl-0">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProductTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-lg bg-neutral-100" />
      ))}
    </div>
  );
}
