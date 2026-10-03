"use client";

import { useState } from "react";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { useOpenOrderDetail } from "@/app/components/admin/orders/OrderDetailDrawer";
import { StatusFilterSelect } from "@/app/components/admin/orders/OrderSelects";
import { OrderStatusPill } from "@/app/components/admin/orders/OrderStatusPill";
import { csvCell, ORDER_STATUS_LABELS } from "@/app/components/admin/orders/formatters";
import { formatNaira } from "@/app/utils/product";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useListAdminOrdersQuery } from "@/redux/slices/adminOrdersApi";
import type { AdminOrderStatus } from "@/redux/types";
import { HistoryPaymentPill } from "./CustomerPills";
import { formatDateTimeLong, HISTORY_PAYMENT_LABELS, ORDER_TYPE_LABELS } from "./formatters";

const PAGE_STEP = 8;
const COLUMNS = ["Order", "Type", "Date", "Amount", "Payment", "Status"];

export type CustomerOrderHistoryProps = {
  customerId: string;
  customerName: string;
};

/** Order History card: filter, export, table and "Show More". */
export function CustomerOrderHistory({ customerId, customerName }: CustomerOrderHistoryProps) {
  const openOrderDetail = useOpenOrderDetail();
  const [status, setStatus] = useState<AdminOrderStatus | "">("");
  // "Show More" asks for a bigger first page, so the list keeps its order and never duplicates.
  const [limit, setLimit] = useState(PAGE_STEP);

  const { currentData, isFetching, isError, error, refetch } = useListAdminOrdersQuery({
    status: status || undefined,
    page: 1,
    perPage: limit,
  });

  const list = currentData?.data;
  const loading = currentData === undefined && isFetching && !isError;
  const orders = list?.items ?? [];
  const total = list?.total ?? 0;
  const canShowMore = orders.length < total;

  function handleExport() {
    if (orders.length === 0) return;
    const header = ["Order", "Type", "Date", "Amount (NGN)", "Payment", "Status"];
    const rows = orders.map((o) => [
      o.orderNumber,
      ORDER_TYPE_LABELS[o.type],
      formatDateTimeLong(o.placedAt),
      o.totalAmount,
      HISTORY_PAYMENT_LABELS[o.paymentStatus],
      ORDER_STATUS_LABELS[o.status],
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${customerName.toLowerCase().replace(/\s+/g, "-")}-orders.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify.success("Export started", { message: "The loaded orders were downloaded as a CSV." });
  }

  return (
    <section aria-labelledby="order-history-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="order-history-heading" className="text-base font-semibold text-neutral-900">
            Order History
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {total} {total === 1 ? "order" : "orders"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusFilterSelect
            value={status}
            onChange={(value) => {
              setStatus(value);
              setLimit(PAGE_STEP);
            }}
          />
          <button
            type="button"
            onClick={handleExport}
            disabled={orders.length === 0}
            className="flex h-11 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <AdminIcon name="export" className="size-4" />
            Export
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-neutral-100 bg-white p-5 sm:p-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-neutral-100" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-neutral-600">{getErrorMessage(error)}</p>
            <button
              type="button"
              onClick={refetch}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-500">
            {status ? "No orders with this status." : "This customer hasn't placed any orders yet."}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
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
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => openOrderDetail(order)}
                      className="cursor-pointer border-t border-neutral-100 hover:bg-neutral-50/60"
                    >
                      <td className="py-4 pr-4 text-sm font-medium text-neutral-900">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openOrderDetail(order);
                          }}
                          className="rounded focus-visible:outline-2 focus-visible:outline-corisio-blue"
                        >
                          {order.orderNumber}
                        </button>
                      </td>
                      <td className="py-4 pr-4 text-sm text-neutral-900">{ORDER_TYPE_LABELS[order.type]}</td>
                      <td className="py-4 pr-4 text-sm text-neutral-900">{formatDateTimeLong(order.placedAt)}</td>
                      <td className="py-4 pr-4 text-sm text-neutral-900">{formatNaira(order.totalAmount)}</td>
                      <td className="py-4 pr-4">
                        <HistoryPaymentPill status={order.paymentStatus} />
                      </td>
                      <td className="py-4">
                        <OrderStatusPill status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {canShowMore && (
              <button
                type="button"
                onClick={() => setLimit((n) => n + PAGE_STEP)}
                disabled={isFetching}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-corisio-blue transition hover:underline disabled:opacity-60"
              >
                {isFetching ? "Loading..." : "Show More"}
                <span aria-hidden="true">→</span>
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
