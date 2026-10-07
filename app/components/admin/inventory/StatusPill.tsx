import type { CategoryStatus, ProductStatus, StockStatus } from "@/redux/types";

const STOCK_STYLES: Record<StockStatus, { label: string; className: string }> = {
  IN_STOCK: { label: "In Stock", className: "bg-corisio-100 text-corisio-blue" },
  LOW_STOCK: { label: "Low Stock", className: "bg-[#fdf0da] text-amber-700" },
  OUT_OF_STOCK: { label: "Out of Stock", className: "bg-[#fbe9e9] text-red-600" },
  ACTIVE: { label: "ACTIVE", className: "bg-corisio-100 text-corisio-blue" },
  INACTIVE: { label: "INACTIVE", className: "bg-[#fbe9e9] text-red-600" },
  DRAFT: { label: "DRAFT", className: "bg-neutral-100 text-neutral-600" },
};

export function StockStatusPill({ status }: { status: StockStatus }) {
  const s = STOCK_STYLES[status];
  console.log(s, status)
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}

const PRODUCT_STYLES: Record<ProductStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-corisio-100 text-corisio-blue" },
  INACTIVE: { label: "Inactive", className: "bg-neutral-100 text-neutral-600" },
  DRAFT: { label: "Draft", className: "bg-[#fdf0da] text-amber-700" },
};

export function ProductStatusPill({ status }: { status: ProductStatus }) {
  const s = PRODUCT_STYLES[status];
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}

const CATEGORY_STYLES: Record<CategoryStatus, string> = {
  ACTIVE: "text-corisio-blue",
  INACTIVE: "text-neutral-400",
};

/** The small dot + label used in the category status select ("• Active"). */
export function CategoryStatusLabel({ status }: { status: CategoryStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${CATEGORY_STYLES[status]}`}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {status === "ACTIVE" ? "Active" : "Inactive"}
    </span>
  );
}
