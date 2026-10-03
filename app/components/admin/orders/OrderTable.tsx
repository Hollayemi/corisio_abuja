"use client";

import { formatNaira } from "@/app/utils/product";
import type { AdminOrderSummary } from "@/redux/types";
import { CustomerAvatar } from "./CustomerAvatar";
import { useOpenOrderDetail } from "./OrderDetailDrawer";
import { formatOrderDateTime } from "./formatters";
import { OrderStatusPill } from "./OrderStatusPill";

const COLUMNS = [
  "Order",
  "Customer Name",
  "Date & Time",
  "Amount",
  "No of Items",
  "Delivery Date",
  "Status",
];

export type OrderRowProps = {
  order: AdminOrderSummary;
  /** Called when the row is clicked. Defaults to opening the Order Details drawer. */
  onOpen: (order: AdminOrderSummary) => void;
};

function OrderRow({ order, onOpen }: OrderRowProps) {
  const open = () => onOpen(order);

  return (
    <tr
      onClick={open}
      className="cursor-pointer border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60"
    >
      <td className="py-4 pr-4 text-sm font-medium text-neutral-900">
        {/* A real button so keyboard users can open the row too */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          className="rounded font-medium focus-visible:outline-2 focus-visible:outline-corisio-blue"
        >
          {order.orderNumber}
        </button>
      </td>
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <CustomerAvatar name={order.customer.fullName} src={order.customer.avatar} />
          <span className="text-sm font-medium text-neutral-900 underline underline-offset-4">
            {order.customer.fullName}
          </span>
        </div>
      </td>
      <td className="py-4 pr-4 text-sm text-neutral-900">{formatOrderDateTime(order.placedAt)}</td>
      <td className="py-4 pr-4 text-sm text-neutral-900">{formatNaira(order.totalAmount)}</td>
      <td className="py-4 pr-4 text-sm text-neutral-900">{order.itemsCount}</td>
      <td className="py-4 pr-4 text-sm text-neutral-900">{formatOrderDateTime(order.deliveredAt)}</td>
      <td className="py-4">
        <OrderStatusPill status={order.status} />
      </td>
    </tr>
  );
}

export type OrderTableProps = {
  orders: AdminOrderSummary[];
  /** Override what a row click does. Defaults to opening the Order Details drawer. */
  onOpenOrder?: (order: AdminOrderSummary) => void;
};

export function OrderTable({ orders, onOpenOrder }: OrderTableProps) {
  const openOrderDetail = useOpenOrderDetail();
  const handleOpen = onOpenOrder ?? ((order: AdminOrderSummary) => openOrderDetail(order));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] text-left">
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
            <OrderRow key={order.id} order={order} onOpen={handleOpen} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type OrderTableSkeletonProps = { rows?: number };

export function OrderTableSkeleton({ rows = 8 }: OrderTableSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-neutral-100" />
      ))}
    </div>
  );
}
