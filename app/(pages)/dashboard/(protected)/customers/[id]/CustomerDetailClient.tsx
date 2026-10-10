"use client";

import Link from "next/link";
import { CustomerHeader } from "@/app/components/admin/customers/CustomerHeader";
import { CustomerOrderHistory } from "@/app/components/admin/customers/CustomerOrderHistory";
import { CustomerActivityList, CustomerPersonalInfo } from "@/app/components/admin/customers/CustomerInfoPanels";
import { CustomerSummaryCards } from "@/app/components/admin/customers/CustomerSummaryCards";
import { getErrorMessage } from "@/redux/config/errors";
import { useGetAdminCustomerQuery } from "@/redux/slices/adminCustomersApi";

export type CustomerDetailClientProps = {
  /** The customer's id from the URL. */
  id: string;
};

export default function CustomerDetailClient({ id }: CustomerDetailClientProps) {
  const { data, isLoading, isError, error, refetch } = useGetAdminCustomerQuery(id);
  const customer = data?.data;

  if (isLoading) return <PageSkeleton />;

  if (isError || !customer) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-neutral-600">{getErrorMessage(error)}</p>
        <div className="flex gap-3">
          <Link
            href="/dashboard/customers"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
          >
            Back to customers
          </Link>
          <button
            type="button"
            onClick={refetch}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CustomerHeader customer={customer} />
      <CustomerSummaryCards customer={customer} />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-8">
          <CustomerOrderHistory customerId={customer.id} customerName={customer.fullName} />
        </div>

        <div className="space-y-6">
          <CustomerPersonalInfo customer={customer} />
          <CustomerActivityList activity={customer.activity} />
        </div>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 w-72 animate-pulse rounded-xl bg-neutral-100" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-neutral-100" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="h-96 animate-pulse rounded-2xl bg-neutral-100" />
        <div className="h-96 animate-pulse rounded-2xl bg-neutral-100" />
      </div>
    </div>
  );
}
