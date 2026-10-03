import { formatNaira } from "@/app/utils/product";
import { formatCount } from "@/app/components/admin/orders/formatters";
import type { AdminCustomerDetail } from "@/redux/types";
import { formatDate } from "./formatters";

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white px-6 py-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-neutral-900 sm:text-[28px]">{value}</p>
    </div>
  );
}

export type CustomerSummaryCardsProps = {
  customer: Pick<AdminCustomerDetail, "totalSpent" | "totalOrders" | "loyaltyPoints" | "customerSince">;
};

/** Total Spent / Total Orders / Loyalty Point Balance / Customer Since. */
export function CustomerSummaryCards({ customer }: CustomerSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Total Spent" value={formatNaira(customer.totalSpent)} />
      <SummaryCard label="Total Orders" value={formatCount(customer.totalOrders)} />
      <SummaryCard label="Loyalty Point Balance" value={formatCount(customer.loyaltyPoints)} />
      <SummaryCard label="Customer Since" value={formatDate(customer.customerSince)} />
    </div>
  );
}
