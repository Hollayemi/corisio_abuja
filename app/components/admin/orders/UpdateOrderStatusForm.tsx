"use client";

import { useState } from "react";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useUpdateAdminOrderStatusMutation } from "@/redux/slices/adminOrdersApi";
import type { AdminOrderDetail, AdminOrderUpdatableStatus } from "@/redux/types";
import { ORDER_STATUS_LABELS } from "./formatters";

export type UpdateOrderStatusFormProps = {
  order: AdminOrderDetail;
  /** Back to the Update / Cancel buttons (also called after a successful update). */
  onBack: () => void;
};

/** Replaces the drawer's footer buttons while staff pick the next status. */
export function UpdateOrderStatusForm({ order, onBack }: UpdateOrderStatusFormProps) {
  const [updateStatus, { isLoading }] = useUpdateAdminOrderStatusMutation();
  const [status, setStatus] = useState<AdminOrderUpdatableStatus>(order.allowedNextStatuses[0]);
  const [note, setNote] = useState("");

  async function handleSubmit() {
    try {
      await updateStatus({
        id: order.id,
        status,
        note: note.trim() || undefined,
      }).unwrap();
      notify.success("Order updated", {
        message: `${order.orderNumber} is now ${ORDER_STATUS_LABELS[status]}.`,
      });
      onBack();
    } catch (err) {
      notify.error("Couldn't update order", { message: getErrorMessage(err) });
    }
  }

  console.log(order.allowedNextStatuses)

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="order-next-status" className="text-sm font-medium text-neutral-900">
          Move order to
        </label>
        <select
          id="order-next-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as AdminOrderUpdatableStatus)}
          disabled={isLoading}
          className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-corisio-blue/30"
        >
          {order.allowedNextStatuses.map((value) => (
            <option key={value} value={value}>
              {ORDER_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="order-status-note" className="text-sm font-medium text-neutral-900">
          Note <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <textarea
          id="order-status-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isLoading}
          rows={2}
          maxLength={300}
          placeholder="Add a note to the timeline"
          className="mt-2 w-full resize-none rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-corisio-blue/30"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="h-11 flex-1 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-60"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="h-11 flex-1 rounded-xl bg-corisio-blue text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
        >
          {isLoading ? "Updating..." : "Confirm Update"}
        </button>
      </div>
    </div>
  );
}
