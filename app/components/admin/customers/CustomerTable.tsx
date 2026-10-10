"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatNaira } from "@/app/utils/product";
import type { AdminCustomerSummary } from "@/redux/types";
import { CustomerAvatar } from "@/app/components/admin/orders/CustomerAvatar";
import { CustomerStatusPill } from "./CustomerPills";
import { formatDate } from "./formatters";

const COLUMNS = [
  "User ID",
  "Email Address",
  "Number",
  "Orders",
  "Total Spent",
  "Last Order",
  "Status",
];

export function customerHref(id: string) {
  return `/dashboard/customers/${id}`;
}

export type CustomerRowProps = {
  customer: AdminCustomerSummary;
  /** Called when the row is clicked. Defaults to opening the customer page. */
  onOpen: (customer: AdminCustomerSummary) => void;
};

function CustomerRow({ customer, onOpen }: CustomerRowProps) {
  return (
    <tr
      onClick={() => onOpen(customer)}
      className="cursor-pointer border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60"
    >
      <td className="py-4 pr-4">
        {/* A real link so it works with the keyboard and "open in new tab" */}
        <Link
          href={customerHref(customer.id)}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-3 rounded focus-visible:outline-2 focus-visible:outline-corisio-blue"
        >
          <CustomerAvatar name={customer.fullName} src={customer.avatar} />
          <span className="text-sm font-medium text-neutral-900">{customer.fullName}</span>
        </Link>
      </td>
      <td className="py-4 pr-4 text-sm text-neutral-900">{customer.email}</td>
      <td className="py-4 pr-4 text-sm text-neutral-900">{customer.phone}</td>
      <td className="py-4 pr-4 text-sm text-neutral-500">{customer.ordersCount}</td>
      <td className="py-4 pr-4 text-sm text-neutral-500">{formatNaira(customer.totalSpent)}</td>
      <td className="py-4 pr-4 text-sm text-neutral-900">{formatDate(customer.lastOrderAt)}</td>
      <td className="py-4">
        <CustomerStatusPill status={customer.status} />
      </td>
    </tr>
  );
}

export type CustomerTableProps = {
  customers: AdminCustomerSummary[];
  /** Override what a row click does. Defaults to opening the customer page. */
  onOpenCustomer?: (customer: AdminCustomerSummary) => void;
};

export function CustomerTable({ customers, onOpenCustomer }: CustomerTableProps) {
  const router = useRouter();
  const handleOpen =
    onOpenCustomer ?? ((customer: AdminCustomerSummary) => router.push(customerHref(customer.id)));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1040px] text-left">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-neutral-500">
            {COLUMNS.map((col) => (
              <th key={col} className="pb-4 pr-4 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <CustomerRow key={customer.id} customer={customer} onOpen={handleOpen} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type CustomerTableSkeletonProps = { rows?: number };

export function CustomerTableSkeleton({ rows = 8 }: CustomerTableSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-neutral-100" />
      ))}
    </div>
  );
}
