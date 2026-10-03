"use client";

import { ActionMenu } from "@/app/components/admin/ActionMenu";
import { CustomerAvatar } from "@/app/components/admin/orders/CustomerAvatar";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useUpdateAdminDeliveryStatusMutation } from "@/redux/slices/adminDeliveriesApi";
import type { AdminDelivery, AdminDeliverySettableStatus } from "@/redux/types/adminDeliveries";
import { dayAndMonthLabel } from "./dates";
import {
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_STYLES,
  DELIVERY_TYPE_LABELS,
  DELIVERY_TYPE_STYLES,
  formatTimeRange,
  SET_STATUS_LABELS,
} from "./formatters";

export type DeliveryCardProps = { delivery: AdminDelivery };

/** One delivery in the side panel: customer, type and time window. */
export function DeliveryCard({ delivery }: DeliveryCardProps) {
  const [updateStatus] = useUpdateAdminDeliveryStatusMutation();

  async function handleSet(status: AdminDeliverySettableStatus) {
    try {
      await updateStatus({ id: delivery.id, status }).unwrap();
      notify.success("Delivery updated", {
        message: `${delivery.customer.fullName}: ${DELIVERY_STATUS_LABELS[status].toLowerCase()}.`,
      });
    } catch (err) {
      notify.error("Couldn't update delivery", { message: getErrorMessage(err) });
    }
  }

  return (
    <li className={`rounded-2xl border p-4 ${DELIVERY_TYPE_STYLES[delivery.type].card}`}>
      <div className="flex items-center gap-3">
        <CustomerAvatar name={delivery.customer.fullName} src={delivery.customer.avatar} className="size-10" />
        <p className="min-w-0 flex-1 truncate text-base font-medium text-neutral-900">
          {delivery.customer.fullName}
        </p>
        {/* Plain "scheduled" stays quiet so the cards match the design */}
        {delivery.status !== "scheduled" && (
          <span
            className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-medium ${DELIVERY_STATUS_STYLES[delivery.status]}`}
          >
            {DELIVERY_STATUS_LABELS[delivery.status]}
          </span>
        )}
        {delivery.allowedNextStatuses.length > 0 && (
          <ActionMenu
            items={delivery.allowedNextStatuses.map((status) => ({
              label: SET_STATUS_LABELS[status],
              onClick: () => handleSet(status),
              destructive: status === "missed",
            }))}
          />
        )}
      </div>

      <p className="mt-4 text-base font-medium text-neutral-900">{DELIVERY_TYPE_LABELS[delivery.type]}</p>
      <p className="mt-1 text-sm text-neutral-600">
        {formatTimeRange(delivery.startTime, delivery.endTime)} ({dayAndMonthLabel(delivery.date)})
      </p>
    </li>
  );
}
