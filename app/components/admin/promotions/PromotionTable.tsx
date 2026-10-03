"use client";

import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { ActionMenu } from "@/app/components/admin/ActionMenu";
import { ConfirmDialog } from "@/app/components/admin/ConfirmDialog";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useDeletePromotionMutation,
  usePausePromotionMutation,
  useResumePromotionMutation,
} from "@/redux/slices/promotionsApi";
import type { Promotion } from "@/redux/types";
import { formatAppliesTo, formatDateTime, formatDiscount } from "./formatters";
import { PromotionDetailDrawer } from "./PromotionDetailDrawer";
import { PromotionFormDialog } from "./PromotionFormDialog";
import { PromotionStatusPill } from "./StatusPill";

const COLUMNS = [
  "Promotion Name",
  "Promotion Type",
  "Applies To",
  "Discount",
  "Start",
  "End",
  "Status",
  "",
];

function PromotionRow({ promotion }: { promotion: Promotion }) {
  const { openDialog } = useDialog();
  const [pausePromotion] = usePausePromotionMutation();
  const [resumePromotion] = useResumePromotionMutation();
  const [deletePromotion] = useDeletePromotionMutation();

  function openDetail() {
    openDialog(({ close }) => <PromotionDetailDrawer promotionId={promotion.id} close={close} />, {
      title: promotion.name,
      side: "right",
      width: "xl",
    });
  }

  function handleEdit() {
    openDialog(({ close }) => <PromotionFormDialog promotion={promotion} close={close} />, {
      title: "Edit Promotion",
      side: "center",
      width: "xl",
    });
  }

  async function handleTogglePause() {
    try {
      if (promotion.status === "PAUSED") {
        await resumePromotion(promotion.id).unwrap();
        notify.success("Promotion resumed");
      } else {
        await pausePromotion(promotion.id).unwrap();
        notify.success("Promotion paused");
      }
    } catch (err) {
      notify.error("Couldn't update promotion", { message: getErrorMessage(err) });
    }
  }

  function handleDelete() {
    openDialog(
      ({ close }) => (
        <ConfirmDialog
          title="Delete this promotion?"
          description={`"${promotion.name}" will be removed and stop applying immediately. This can't be undone.`}
          onConfirm={async () => {
            try {
              await deletePromotion(promotion.id).unwrap();
              notify.success("Promotion deleted");
            } catch (err) {
              notify.error("Couldn't delete promotion", { message: getErrorMessage(err) });
              throw err;
            }
          }}
          close={close}
        />
      ),
      { title: "Delete promotion", side: "center", width: "sm" },
    );
  }

  return (
    <tr className="cursor-pointer border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60">
      <td className="py-4 pr-4 text-sm font-medium text-neutral-900" onClick={openDetail}>
        {promotion.name}
      </td>
      <td className="py-4 pr-4 text-sm text-neutral-700" onClick={openDetail}>
        {promotion.type === "COUPON_CODE" ? "Coupon" : "Promotion"}
      </td>
      <td className="py-4 pr-4 text-sm text-neutral-700" onClick={openDetail}>
        {formatAppliesTo(promotion)}
      </td>
      <td className="py-4 pr-4 text-sm text-neutral-900" onClick={openDetail}>
        {formatDiscount(promotion)}
      </td>
      <td className="py-4 pr-4 text-sm text-neutral-500" onClick={openDetail}>
        {formatDateTime(promotion.startAt)}
      </td>
      <td className="py-4 pr-4 text-sm text-neutral-500" onClick={openDetail}>
        {promotion.endAt ? formatDateTime(promotion.endAt) : "-"}
      </td>
      <td className="py-4 pr-4" onClick={openDetail}>
        <PromotionStatusPill status={promotion.status} />
      </td>
      <td className="py-4" onClick={(e) => e.stopPropagation()}>
        <ActionMenu
          items={[
            { label: "Edit", onClick: handleEdit, icon: <AdminIcon name="edit" className="size-4" /> },
            {
              label: promotion.status === "PAUSED" ? "Resume" : "Pause",
              onClick: handleTogglePause,
              icon: <AdminIcon name={promotion.status === "PAUSED" ? "play" : "pause"} className="size-4" />,
            },
            {
              label: "Delete",
              onClick: handleDelete,
              icon: <AdminIcon name="trash" className="size-4" />,
              destructive: true,
            },
          ]}
        />
      </td>
    </tr>
  );
}

export function PromotionTable({ promotions }: { promotions: Promotion[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left">
        <thead>
          <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-400">
            {COLUMNS.map((col) => (
              <th key={col} className="pb-3 pr-4 font-normal first:pl-0">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {promotions.map((promotion) => (
            <PromotionRow key={promotion.id} promotion={promotion} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PromotionTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-lg bg-neutral-100" />
      ))}
    </div>
  );
}
