"use client";

import { useState } from "react";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import { formatNaira } from "@/app/utils/product";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useGetAdminOrderQuery } from "@/redux/slices/adminOrdersApi";
import type { AdminOrderDetail, AdminOrderSummary } from "@/redux/types";
import { CancelOrderForm } from "./CancelOrderForm";
import { formatOrderDateTime } from "./formatters";
import { OrderStatusGroupPill, PaymentStatusPill } from "./OrderStatusPill";
import { OrderTimeline } from "./OrderTimeline";
import { UpdateOrderStatusForm } from "./UpdateOrderStatusForm";

/**
 * Opens the Order Details drawer from anywhere (table rows today, the
 * customers page later):
 *   const openOrderDetail = useOpenOrderDetail();
 *   openOrderDetail(order);
 */
export function useOpenOrderDetail() {
  const { openDialog } = useDialog();

  return (order: Pick<AdminOrderSummary, "id" | "orderNumber">) =>
    openDialog(({ close }) => <OrderDetailDrawer orderId={order.id} close={close} />, {
      title: `Order ${order.orderNumber}`,
      side: "right",
      width: "lg",
    });
}

type FooterMode = "actions" | "update" | "cancel";

export type OrderDetailDrawerProps = {
  orderId: string;
  close: () => void;
};

export function OrderDetailDrawer({ orderId, close }: OrderDetailDrawerProps) {
  const { data, isLoading, isError, error, refetch } = useGetAdminOrderQuery(orderId);
  const [mode, setMode] = useState<FooterMode>("actions");
  const order = data?.data;

  async function handleCopy() {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      notify.success("Order number copied", { id: "order-copy" });
    } catch {
      notify.error("Couldn't copy", { message: "Copy the order number by hand instead." });
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4 bg-neutral-50 px-6 py-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-neutral-900">
              {order?.orderNumber ?? (isLoading ? "Loading..." : "Order")}
            </h2>
            {order && (
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy order number"
                className="rounded p-0.5 text-neutral-400 transition hover:text-neutral-700"
              >
                <CopyIcon />
              </button>
            )}
          </div>
          <p className="text-xs text-neutral-500">Order Details</p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="flex size-7 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50"
        >
          <AdminIcon name="close" className="size-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        {isLoading ? (
          <DrawerSkeleton />
        ) : isError || !order ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-neutral-600">{getErrorMessage(error)}</p>
            <button
              type="button"
              onClick={refetch}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
            >
              Try again
            </button>
          </div>
        ) : (
          <OrderBody order={order} />
        )}
      </div>

      {order && (
        <div className="border-t border-neutral-100 px-6 py-4">
          {mode === "update" && order.allowedNextStatuses.length > 0 ? (
            <UpdateOrderStatusForm order={order} onBack={() => setMode("actions")} />
          ) : mode === "cancel" && order.canCancel ? (
            <CancelOrderForm order={order} onBack={() => setMode("actions")} />
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMode("update")}
                disabled={order.allowedNextStatuses.length === 0}
                className="h-11 flex-1 rounded-xl border border-neutral-300 bg-white text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Update Order Status
              </button>
              <button
                type="button"
                onClick={() => setMode("cancel")}
                disabled={!order.canCancel}
                className="h-11 flex-1 rounded-xl bg-[#c0392b] text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel Order
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Body                                                                */
/* ------------------------------------------------------------------ */

function OrderBody({ order }: { order: AdminOrderDetail }) {
  return (
    <>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-neutral-400">Created at</p>
          <p className="mt-2 font-semibold text-neutral-900">{formatOrderDateTime(order.placedAt)}</p>
        </div>
        <div>
          <p className="text-neutral-400">Payment</p>
          <p className="mt-2">
            <PaymentStatusPill status={order.paymentStatus} />
          </p>
        </div>
        <div>
          <p className="text-neutral-400">Status</p>
          <p className="mt-2">
            <OrderStatusGroupPill status={order.status} />
          </p>
        </div>
      </div>

      {order.cancellation && (
        <div className="mt-5 rounded-xl bg-[#fbe9e9] px-4 py-3 text-sm text-red-700">
          <p className="font-medium">Cancelled {formatOrderDateTime(order.cancellation.cancelledAt)}</p>
          <p className="mt-0.5 text-red-600">{order.cancellation.reason}</p>
        </div>
      )}

      <Section title="Customer">
        <dl className="mt-4 space-y-3 text-sm">
          <InfoRow label="Full name:" value={order.customer.fullName} />
          <InfoRow label="Email:" value={order.customer.email} />
          <InfoRow label="Phone Number:" value={order.customer.phone} />
          <InfoRow label="Shipping Address:" value={order.shippingAddress} />
        </dl>
      </Section>

      <Section title="Timeline">
        <OrderTimeline events={order.timeline} />
      </Section>

      <Section
        title="Items"
        badge={order.itemsCount}
      >
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-medium text-neutral-600">
              <th className="pb-3 font-medium">Product Details</th>
              <th className="pb-3 pr-4 font-medium">Qty</th>
              <th className="pb-3 text-right font-medium">Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-t border-neutral-100">
                <td className="py-3 pr-2">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt="" className="size-full object-cover" />
                      ) : (
                        <AdminIcon name="package" className="size-4 text-neutral-400" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-neutral-900">{item.name}</p>
                      <p className="text-xs text-neutral-400">#{item.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 font-medium text-neutral-900">{item.quantity}</td>
                <td className="py-3 text-right font-medium text-neutral-900">
                  {formatNaira(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Payment Summary">
        <dl className="mt-4 space-y-3 text-sm">
          <SummaryRow label="Items Total" value={formatNaira(order.itemsTotal)} />
          <SummaryRow label="Discount" value={formatNaira(order.discount)} />
          <SummaryRow label="Delivery Fee" value={formatNaira(order.deliveryFee)} />
          <SummaryRow label="Total" value={formatNaira(order.total)} strong />
        </dl>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function Section({
  title,
  badge,
  children,
}: {
  title: string;
  /** Small grey count next to the title, e.g. Items 5 */
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 border-t border-neutral-100 pt-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
        {title}
        {badge !== undefined && (
          <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-600">
            {badge}
          </span>
        )}
      </h3>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[9.5rem_1fr] gap-4">
      <dt className="text-neutral-400">{label}</dt>
      <dd className="font-semibold text-neutral-900">{value}</dd>
    </div>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-neutral-500">{label}</dt>
      <dd className={strong ? "font-semibold text-neutral-900" : "font-medium text-neutral-900"}>{value}</dd>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" strokeLinecap="round" />
    </svg>
  );
}

function DrawerSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-neutral-100" />
        ))}
      </div>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="h-4 animate-pulse rounded bg-neutral-100" />
      ))}
    </div>
  );
}
