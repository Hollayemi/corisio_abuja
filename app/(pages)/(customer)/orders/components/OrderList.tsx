"use client";

import type { OrderSummary } from "@/redux/types";
import { formatOrderDate, formatOrderId, type OrdersTab } from "@/app/utils/order";
import StatusBadge from "./StatusBadge";

const TABS: { value: OrdersTab; label: string }[] = [
  { value: "orders", label: "Orders" },
  { value: "cancelled", label: "Cancelled / Returned" },
];

export default function OrderList({
  activeTab,
  onTabChange,
  orders,
  isLoading = false,
  isError = false,
  selectedId,
  onSelect,
}: {
  activeTab: OrdersTab;
  onTabChange: (tab: OrdersTab) => void;
  orders: OrderSummary[];
  isLoading?: boolean;
  isError?: boolean;
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      {/* Tabs */}
      <div role="tablist" aria-label="Order status" className="flex border-b border-neutral-200">
        {TABS.map((tab) => {
          const active = tab.value === activeTab;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(tab.value)}
              className={`relative -mb-px whitespace-nowrap px-1 pb-3 text-sm font-semibold transition-colors first:mr-8 focus-visible:outline-none ${
                active ? "text-corisio-yellow" : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              {tab.label}
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-px left-0 h-0.5 w-full rounded-full bg-corisio-blue"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <ul className="mt-1 flex flex-col gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="animate-pulse rounded-xl px-3 py-4">
              <div className="h-3.5 w-2/3 rounded bg-neutral-200" />
              <div className="mt-2 h-3 w-1/2 rounded bg-neutral-200" />
            </li>
          ))}
        </ul>
      ) : isError ? (
        <p className="py-10 text-center text-sm text-neutral-400">
          Couldn&rsquo;t load orders. Please try again.
        </p>
      ) : orders.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-400">
          No orders here yet.
        </p>
      ) : (
        <ul className="mt-1 flex flex-col">
          {orders.map((order) => {
            const selected = order.id === selectedId;
            return (
              <li key={order.id}>
                <button
                  type="button"
                  onClick={() => onSelect(order.id)}
                  aria-current={selected ? "true" : undefined}
                  className={`flex w-full items-start justify-between gap-3 rounded-xl px-3 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue ${
                    selected ? "bg-[#faf1e6]" : "hover:bg-neutral-50"
                  }`}
                >
                  <span>
                    <span
                      className={`block text-sm font-semibold ${
                        selected ? "text-corisio-yellow" : "text-neutral-900"
                      }`}
                    >
                      Order {formatOrderId(order)}
                    </span>
                    <span
                      className={`mt-1 block text-xs ${
                        selected ? "text-corisio-yellow/70" : "text-neutral-400"
                      }`}
                    >
                      {formatOrderDate(order.placedAt)} · {order.itemsCount} items
                    </span>
                  </span>

                  <StatusBadge status={order.status} className="mt-0.5 shrink-0" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}