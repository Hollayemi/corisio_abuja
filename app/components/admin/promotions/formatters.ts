import { formatNaira } from "@/app/utils/product";
import type { AppliesTo, DiscountType, Promotion } from "@/redux/types";

/** 15 + "PERCENTAGE" -> "15%"; 5000 + "FIXED_AMOUNT" -> "₦5,000 OFF"; "free_delivery" -> "Free" */
export function formatDiscount(promotion: Pick<Promotion, "discountType" | "discountValue">) {
  switch (promotion.discountType) {
    case "PERCENTAGE":
      return `${promotion.discountValue}%`;
    case "FIXED_AMOUNT":
      return `${formatNaira(promotion.discountValue)} OFF`;
    case "FREE_DELIVERY":
      return "Free";
  }
}

const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  PERCENTAGE: "Percentage Discount",
  FIXED_AMOUNT: "Fixed Amount Off",
  FREE_DELIVERY: "Free Delivery",
};

export function formatDiscountType(type: DiscountType) {
  return DISCOUNT_TYPE_LABELS[type];
}

const APPLIES_TO_LABELS: Record<AppliesTo, string> = {
  ALL_ORDERS: "All orders",
  CATEGORY: "Selected category",
  SPECIFIC_PRODUCTS: "Selected products",
};

export function formatAppliesTo(promotion: Pick<Promotion, "appliesTo" | "affectedCount" | "category">) {
  if (promotion.appliesTo === "ALL_ORDERS") return "All orders";
  if (promotion.appliesTo === "CATEGORY" && promotion.category) return promotion.category.name;
  return `${promotion.affectedCount} products`;
}

export function formatAppliesToSummary(appliesTo: AppliesTo) {
  return APPLIES_TO_LABELS[appliesTo];
}

export function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  const datePart = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const timePart = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${datePart} · ${timePart}`;
}

/** ISO -> "2026-09-19T10:00" for a <input type="datetime-local"> */
export function toDateTimeLocal(iso?: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
