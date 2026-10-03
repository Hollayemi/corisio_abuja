"use client";

import { ActionMenu } from "@/app/components/admin/ActionMenu";
import { ConfirmDialog } from "@/app/components/admin/ConfirmDialog";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import { formatCount } from "@/app/components/admin/orders/formatters";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useDeleteAdminMembershipPlanMutation,
  useUpdateAdminMembershipPlanMutation,
} from "@/redux/slices/adminMembershipApi";
import type { AdminMembershipPlan } from "@/redux/types";
import {
  DELIVERY_FREQUENCY_LABELS,
  formatCompactNaira,
  formatPlanPrice,
} from "./formatters";
import { ActiveStatusPill } from "./MembershipPills";
import { PlanFormDialog } from "./PlanFormDialog";

const COLUMNS = ["Plan", "Price", "Members", "Monthly Revenue", "Delivery", "Status", ""];

/** Opens the New Plan dialog. Shared by the page header and the empty state. */
export function useOpenPlanForm() {
  const { openDialog } = useDialog();
  return (plan?: AdminMembershipPlan) =>
    openDialog(({ close }) => <PlanFormDialog plan={plan} close={close} />, {
      title: plan ? "Edit Plan" : "New Plan",
      side: "center",
      width: "xl",
    });
}

export type PlanRowProps = { plan: AdminMembershipPlan };

function PlanRow({ plan }: PlanRowProps) {
  const { openDialog } = useDialog();
  const openPlanForm = useOpenPlanForm();
  const [updatePlan] = useUpdateAdminMembershipPlanMutation();
  const [deletePlan] = useDeleteAdminMembershipPlanMutation();
  const isActive = plan.status === "active";

  async function handleToggle() {
    try {
      await updatePlan({ id: plan.id, status: isActive ? "inactive" : "active" }).unwrap();
      notify.success(isActive ? "Plan deactivated" : "Plan activated", {
        message: isActive
          ? `"${plan.name}" can't be bought any more. Current members keep it.`
          : `"${plan.name}" is open for new members.`,
      });
    } catch (err) {
      notify.error("Couldn't update plan", { message: getErrorMessage(err) });
    }
  }

  function handleDelete() {
    if (plan.membersCount > 0) {
      notify.error("This plan has members", {
        message: "Deactivate it instead, so current members keep their plan.",
      });
      return;
    }

    openDialog(
      ({ close }) => (
        <ConfirmDialog
          title="Delete this plan?"
          description={`"${plan.name}" will be removed. This can't be undone.`}
          onConfirm={async () => {
            try {
              await deletePlan(plan.id).unwrap();
              notify.success("Plan deleted");
            } catch (err) {
              notify.error("Couldn't delete plan", { message: getErrorMessage(err) });
              throw err;
            }
          }}
          close={close}
        />
      ),
      { title: "Delete plan", side: "center", width: "sm" },
    );
  }

  return (
    <tr className="border-t border-neutral-100">
      <td className="py-5 pr-4 text-sm font-semibold text-neutral-900">{plan.name}</td>
      <td className="py-5 pr-4 text-sm font-medium text-neutral-900">
        {formatPlanPrice(plan.price, plan.interval)}
      </td>
      <td className="py-5 pr-4 text-sm font-medium text-neutral-900">{formatCount(plan.membersCount)}</td>
      <td className="py-5 pr-4 text-sm font-medium text-neutral-900">{formatCompactNaira(plan.monthlyRevenue)}</td>
      <td className="py-5 pr-4 text-sm font-medium text-neutral-900">
        {DELIVERY_FREQUENCY_LABELS[plan.deliveryFrequency]}
      </td>
      <td className="py-5 pr-4">
        <ActiveStatusPill status={plan.status} />
      </td>
      <td className="py-5 text-right">
        <ActionMenu
          items={[
            { label: "Edit", icon: <AdminIcon name="edit" className="size-4" />, onClick: () => openPlanForm(plan) },
            {
              label: isActive ? "Deactivate" : "Activate",
              icon: <AdminIcon name={isActive ? "pause" : "play"} className="size-4" />,
              onClick: handleToggle,
            },
            { label: "Delete", icon: <AdminIcon name="trash" className="size-4" />, destructive: true, onClick: handleDelete },
          ]}
        />
      </td>
    </tr>
  );
}

export type PlanTableProps = { plans: AdminMembershipPlan[] };

export function PlanTable({ plans }: PlanTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-neutral-500">
            {COLUMNS.map((col, i) => (
              <th key={col || i} className="pb-4 pr-4 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => (
            <PlanRow key={plan.id} plan={plan} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
