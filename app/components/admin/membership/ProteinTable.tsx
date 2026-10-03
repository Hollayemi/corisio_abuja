"use client";

import { ActionMenu } from "@/app/components/admin/ActionMenu";
import { ConfirmDialog } from "@/app/components/admin/ConfirmDialog";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useDeleteAdminProteinMutation,
  useUpdateAdminProteinMutation,
} from "@/redux/slices/adminMembershipApi";
import type { AdminProtein } from "@/redux/types";
import { formatPercent } from "./formatters";
import { ActiveStatusPill } from "./MembershipPills";
import { ProteinFormDialog } from "./ProteinFormDialog";

const COLUMNS = ["Protein", "Description", "Sold (this month)", "Status", ""];

/** Opens the Add / Edit Protein dialog. Shared by the page header and the empty state. */
export function useOpenProteinForm() {
  const { openDialog } = useDialog();
  return (protein?: AdminProtein) =>
    openDialog(({ close }) => <ProteinFormDialog protein={protein} close={close} />, {
      title: protein ? "Edit Protein" : "Add Protein",
      side: "center",
      width: "xl",
    });
}

export type SoldBarProps = {
  /** 0 to 100 */
  percentage: number;
  /** Used for the accessible name, e.g. "Chicken". */
  label: string;
};

/** A thin bar plus the percentage, showing this protein's share of everything sold. */
export function SoldBar({ percentage, label }: SoldBarProps) {
  const clamped = Math.min(100, Math.max(0, percentage));
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-label={`${label} share of protein sold`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        className="h-2 w-32 shrink-0 overflow-hidden rounded-full bg-neutral-100 sm:w-44"
      >
        <div className="h-full rounded-full bg-corisio-blue" style={{ width: `${clamped}%` }} />
      </div>
      <span className="w-12 text-sm font-semibold tabular-nums text-neutral-900">
        {formatPercent(percentage)}
      </span>
    </div>
  );
}

export type ProteinRowProps = { protein: AdminProtein };

function ProteinRow({ protein }: ProteinRowProps) {
  const { openDialog } = useDialog();
  const openProteinForm = useOpenProteinForm();
  const [updateProtein] = useUpdateAdminProteinMutation();
  const [deleteProtein] = useDeleteAdminProteinMutation();
  const isActive = protein.status === "active";

  async function handleToggle() {
    try {
      await updateProtein({ id: protein.id, status: isActive ? "inactive" : "active" }).unwrap();
      notify.success(isActive ? "Protein deactivated" : "Protein activated", {
        message: isActive
          ? `Members can't pick "${protein.label}" in new mixes.`
          : `Members can pick "${protein.label}" again.`,
      });
    } catch (err) {
      notify.error("Couldn't update protein", { message: getErrorMessage(err) });
    }
  }

  function handleDelete() {
    openDialog(
      ({ close }) => (
        <ConfirmDialog
          title="Delete this protein?"
          description={`"${protein.label}" will be removed from the list members choose from. This can't be undone.`}
          onConfirm={async () => {
            try {
              await deleteProtein(protein.id).unwrap();
              notify.success("Protein deleted");
            } catch (err) {
              notify.error("Couldn't delete protein", { message: getErrorMessage(err) });
              throw err;
            }
          }}
          close={close}
        />
      ),
      { title: "Delete protein", side: "center", width: "sm" },
    );
  }

  return (
    <tr className="border-t border-neutral-100">
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
            {protein.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={protein.image} alt="" className="size-full object-cover" />
            ) : (
              <AdminIcon name="package" className="size-5 text-neutral-400" />
            )}
          </span>
          <span className="text-sm font-semibold text-neutral-900">{protein.label}</span>
        </div>
      </td>
      <td className="max-w-xs py-4 pr-6 text-sm text-neutral-500">
        <p className="line-clamp-2">{protein.description}</p>
      </td>
      <td className="py-4 pr-4">
        <SoldBar percentage={protein.soldPercentage} label={protein.label} />
      </td>
      <td className="py-4 pr-4">
        <ActiveStatusPill status={protein.status} />
      </td>
      <td className="py-4 text-right">
        <ActionMenu
          items={[
            { label: "Edit", icon: <AdminIcon name="edit" className="size-4" />, onClick: () => openProteinForm(protein) },
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

export type ProteinTableProps = { proteins: AdminProtein[] };

export function ProteinTable({ proteins }: ProteinTableProps) {
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
          {proteins.map((protein) => (
            <ProteinRow key={protein.id} protein={protein} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
