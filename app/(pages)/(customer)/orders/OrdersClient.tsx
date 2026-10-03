"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  useGetOrderQuery,
  useListOrdersQuery,
  useRateOrderMutation,
} from "@/redux/slices/ordersApi";
import EmptyOrderState from "./components/EmptyOrderState";
import OrderDetail from "./components/OrderDetail";
import OrderList from "./components/OrderList";
import { tabForStatus, type OrdersTab } from "@/app/utils/order";
import OrderDetailSkeleton from "./components/OrderDetailSkeleton";

export default function OrdersClient({
  initialTab,
  initialOrderId,
}: {
  initialTab: OrdersTab;
  initialOrderId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [tab, setTab] = useState<OrdersTab>(initialTab);
  const [selectedId, setSelectedId] = useState<string | undefined>(initialOrderId);

  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    isError: isListError,
  } = useListOrdersQuery({ tab });
  const orders = listData?.data.orders ?? [];

  const {
    data: orderData,
    isLoading: isOrderLoading,
    isFetching: isOrderFetching,
    isError: isOrderError,
  } = useGetOrderQuery(selectedId ?? "", { skip: !selectedId });
  const selectedOrder = orderData?.data;

  const [rateOrder, { isLoading: isRating }] = useRateOrderMutation();

  // Deep-linking straight to ?order=ID (no ?tab=) doesn't know up front which
  // tab that order lives under. Once its detail arrives, correct the tab to
  // match — adjusted during render (not an effect), per React's guidance on
  // adjusting state when a prop/derived value changes.
  const [lastSeenOrderId, setLastSeenOrderId] = useState<string | undefined>(undefined);
  if (selectedOrder && selectedOrder.id !== lastSeenOrderId) {
    setLastSeenOrderId(selectedOrder.id);
    const expectedTab = tabForStatus(selectedOrder.status);
    if (expectedTab !== tab) setTab(expectedTab);
  }

  function syncUrl(nextTab: OrdersTab, nextOrderId?: string) {
    const params = new URLSearchParams();
    if (nextTab === "cancelled") params.set("tab", "cancelled");
    if (nextOrderId) params.set("order", nextOrderId);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleTabChange(nextTab: OrdersTab) {
    setTab(nextTab);
    setSelectedId(undefined);
    syncUrl(nextTab, undefined);
  }

  function handleSelect(id: string) {
    setSelectedId(id);
    syncUrl(tab, id);
  }

  function handleBack() {
    setSelectedId(undefined);
    syncUrl(tab, undefined);
  }

  async function handleSubmitRating(orderId: string, stars: number, comment: string) {
    try {
      await rateOrder({
        id: orderId,
        stars: Math.min(5, Math.max(1, stars)) as 1 | 2 | 3 | 4 | 5,
        comment: comment || undefined,
      }).unwrap();
    } catch {
      // The submit button surfaces isRating; a toast/error banner can hook in here later.
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[350px_minmax(0,1fr)] lg:gap-10">
      <div className={selectedId ? "hidden lg:block" : "block"}>
        <OrderList
          activeTab={tab}
          onTabChange={handleTabChange}
          orders={orders}
          isLoading={isListLoading || isListFetching}
          isError={isListError}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>

      <div className={selectedId ? "block" : "hidden lg:block"}>
        {selectedId ? (
          <>
            <button
              type="button"
              onClick={handleBack}
              className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-corisio-blue lg:hidden"
            >
              ← Back to orders
            </button>
            {isOrderLoading || isOrderFetching ? (
              <OrderDetailSkeleton />
            ) : isOrderError || !selectedOrder ? (
              <p className="py-20 text-center text-sm text-neutral-500">
                Couldn&rsquo;t load this order. Please try again.
              </p>
            ) : (
              <OrderDetail
                order={selectedOrder}
                onSubmitRating={handleSubmitRating}
                isRating={isRating}
              />
            )}
          </>
        ) : (
          <EmptyOrderState />
        )}
      </div>
    </div>
  );
}