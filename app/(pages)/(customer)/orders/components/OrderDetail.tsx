"use client";

import Image from "next/image";
import { useState } from "react";
import { CopyIcon } from "@/app/components/ui/icons";
import { formatNaira } from "@/app/utils/product";
import type { OrderDetail as OrderDetailData } from "@/redux/types";
import { formatOrderDateTime, formatOrderId, getUnitLabel } from "@/app/utils/order";
import StatusBadge from "./StatusBadge";
import TrackTimeline from "./TrackTimeline";

function CopyOrderId({ order }: { order: OrderDetailData }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatOrderId(order));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — fail silently, nothing else to do here.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy order ID"
      title={copied ? "Copied!" : "Copy order ID"}
      className="text-neutral-400 transition hover:text-corisio-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
    >
      <CopyIcon className="size-3.5" />
    </button>
  );
}

function InfoCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-xs text-neutral-400">{label}:</span>{" "}
      <span className="text-sm font-semibold text-neutral-900">{children}</span>
    </div>
  );
}

function SummaryRow({
  label,
  children,
  bold = false,
}: {
  label: string;
  children: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-neutral-400">{label}</span>
      <span className={bold ? "font-semibold text-neutral-900" : "text-neutral-800"}>
        {children}
      </span>
    </div>
  );
}

export default function OrderDetail({
  order,
  onSubmitRating,
  isRating = false,
}: {
  order: OrderDetailData;
  onSubmitRating: (orderId: string, stars: number, comment: string) => void;
  isRating?: boolean;
}) {
  return (
    <div>
      <h1 className="text-lg font-semibold text-neutral-900">Order Details</h1>

      {/* Order meta */}
      <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 rounded-2xl bg-neutral-100/70 p-5 sm:grid-cols-2">
        <InfoCell label="Order ID">
          <span className="inline-flex items-center gap-1.5">
            {formatOrderId(order)}
            <CopyOrderId order={order} />
          </span>
        </InfoCell>
        <InfoCell label="Order Date">{formatOrderDateTime(order.placedAt)}</InfoCell>
        <InfoCell label="Delivery Type">{order.deliveryType}</InfoCell>
        <InfoCell label="Order Status">
          <StatusBadge status={order.status} className="text-sm font-semibold" />
        </InfoCell>
      </div>

      {/* Items */}
      <ul className="mt-6 flex flex-col gap-5">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-4">
            <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-neutral-50">
              <Image src={item.image} alt="" fill sizes="56px" className="object-contain p-1.5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm text-neutral-700">{item.name}</span>
              <span className="mt-1 flex items-baseline gap-2">
                <span className="text-sm font-bold text-neutral-900">
                  {formatNaira(item.price)}
                </span>
                <span className="text-xs text-neutral-400">
                  {item.quantity} {getUnitLabel(item)}
                </span>
              </span>
            </span>
          </li>
        ))}
      </ul>

      {/* Summary */}
      <div className="mt-6 flex flex-col divide-y divide-neutral-100 border-t border-neutral-100">
        <SummaryRow label="Receiver's Number">{order.receiverPhone}</SummaryRow>
        <SummaryRow label="Delivery Address">{order.deliveryAddress}</SummaryRow>
        <SummaryRow label="Email">{order.email}</SummaryRow>
        <SummaryRow label="Items Total" bold>
          {formatNaira(order.itemsTotal)}
        </SummaryRow>
        <SummaryRow label="Discount" bold>
          {formatNaira(order.discount)}
        </SummaryRow>
        <SummaryRow label="Delivery Fee" bold>
          {formatNaira(order.deliveryFee)}
        </SummaryRow>
      </div>

      <div className="mt-2 border-t border-neutral-100 pt-8">
        <TrackTimeline
          order={order}
          onSubmitRating={(stars, comment) => onSubmitRating(order.id, stars, comment)}
          isRating={isRating}
        />
      </div>
    </div>
  );
}