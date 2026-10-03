"use client";

import { useState } from "react";
import { SelectField, TextareaField, TextField } from "@/app/components/admin/inventory/fields";
import { ModalButton, ModalHeader } from "@/app/components/admin/inventory/ModalHeader";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useCreateAdminMembershipPlanMutation,
  useUpdateAdminMembershipPlanMutation,
} from "@/redux/slices/adminMembershipApi";
import type {
  AdminActiveStatus,
  AdminDeliveryFrequency,
  AdminMembershipInterval,
  AdminMembershipPlan,
} from "@/redux/types";
import { ACTIVE_STATUS_OPTIONS, PLAN_FREQUENCY_OPTIONS, PLAN_INTERVAL_OPTIONS } from "./formatters";

export type PlanFormDialogProps = {
  /** Omit to create a new plan. */
  plan?: AdminMembershipPlan;
  close: () => void;
};

/** "New Plan" / "Edit Plan" dialog, opened from the Overview tab. */
export function PlanFormDialog({ plan, close }: PlanFormDialogProps) {
  const [createPlan, { isLoading: creating }] = useCreateAdminMembershipPlanMutation();
  const [updatePlan, { isLoading: updating }] = useUpdateAdminMembershipPlanMutation();
  const loading = creating || updating;

  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [price, setPrice] = useState(plan ? String(plan.price) : "");
  const [interval, setInterval] = useState<AdminMembershipInterval>(plan?.interval ?? "month");
  const [frequency, setFrequency] = useState<AdminDeliveryFrequency>(plan?.deliveryFrequency ?? "weekly");
  const [status, setStatus] = useState<AdminActiveStatus>(plan?.status ?? "active");
  const [error, setError] = useState("");

  const priceNumber = Number(price);
  const valid = name.trim().length >= 2 && price.trim().length > 0 && priceNumber > 0;

  async function handleSave() {
    if (!valid || loading) return;
    setError("");

    const body = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: priceNumber,
      interval,
      deliveryFrequency: frequency,
      status,
    };

    try {
      if (plan) {
        await updatePlan({ id: plan.id, ...body }).unwrap();
        notify.success("Plan updated", { message: `"${body.name}" was saved.` });
      } else {
        await createPlan(body).unwrap();
        notify.success("Plan created", { message: `"${body.name}" is ready for new members.` });
      }
      close();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <ModalHeader
        title={plan ? "Edit Plan" : "New Plan"}
        onClose={close}
        actions={
          <ModalButton onClick={handleSave} disabled={!valid} loading={loading}>
            <SaveIcon /> {loading ? "Saving..." : "Save"}
          </ModalButton>
        }
      />

      <div className="max-h-[calc(90dvh-73px)] overflow-y-auto px-6 py-6 sm:px-8">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-neutral-900">
            {plan ? "Edit membership plan" : "Create a membership plan"}
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            {plan
              ? "Changes to the price apply from each member's next billing date."
              : "Members subscribe to a plan and get protein deliveries on its schedule."}
          </p>
        </div>

        <div className="space-y-5">
          <TextField label="Plan Name" value={name} onChange={setName} placeholder="e.g. Gold" required />

          <TextareaField
            label="Description"
            hint="Optional. Shown to customers when they pick a plan."
            value={description}
            onChange={setDescription}
            rows={3}
            maxLength={300}
            placeholder="Weekly protein delivery for a small household."
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <TextField
              label="Price (₦)"
              type="number"
              min={0}
              value={price}
              onChange={setPrice}
              placeholder="e.g. 50000"
              required
            />
            <SelectField
              label="Billing Cycle"
              value={interval}
              onChange={(v) => setInterval(v as AdminMembershipInterval)}
              options={PLAN_INTERVAL_OPTIONS}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SelectField
              label="Delivery"
              hint="How often members get their protein."
              value={frequency}
              onChange={(v) => setFrequency(v as AdminDeliveryFrequency)}
              options={PLAN_FREQUENCY_OPTIONS}
            />
            <SelectField
              label="Status"
              hint="Inactive plans can't be bought. Current members keep theirs."
              value={status}
              onChange={(v) => setStatus(v as AdminActiveStatus)}
              options={ACTIVE_STATUS_OPTIONS}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path d="M5 3h11l3 3v15H5z" />
      <path d="M9 3v6h6V3" />
      <path d="M8 21v-7h8v7" />
    </svg>
  );
}
