"use client";

import { useDialog } from "@/app/components/dialog/DialogProvider";
import { ConfirmDialog } from "@/app/components/admin/ConfirmDialog";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useDeleteStoreBranchMutation, useListStoreBranchesQuery } from "@/redux/slices/storeProfileApi";
import type { StoreBranch } from "@/redux/types";
import { SectionError, SectionSkeleton, SettingsCard } from "../Controls";
import { BranchFormDialog } from "./BranchFormDialog";
import { CardHeading } from "./fields";

/** Extra locations (StoreAddress). The main location is edited in the card above. */
export function StoreBranches({ storeId, canEdit }: { storeId: string; canEdit: boolean }) {
  const { openDialog } = useDialog();
  const branches = useListStoreBranchesQuery(storeId);
  const [deleteBranch] = useDeleteStoreBranchMutation();

  if (branches.isLoading) return <SectionSkeleton rows={2} />;
  if (branches.isError || !branches.data) {
    return <SectionError message={getErrorMessage(branches.error)} onRetry={branches.refetch} />;
  }

  const items = branches.data.data.items;

  function openForm(branch?: StoreBranch) {
    openDialog(
      ({ close }) => <BranchFormDialog storeId={storeId} branch={branch} isFirst={items.length === 0} close={close} />,
      { title: branch ? "Edit branch" : "Add a branch", side: "center", width: "2xl" },
    );
  }

  function confirmDelete(branch: StoreBranch) {
    openDialog(
      ({ close }) => (
        <ConfirmDialog
          title="Remove this branch?"
          description={`"${branch.label}" will no longer show on the map. This can't be undone.`}
          confirmLabel="Remove"
          onConfirm={async () => {
            try {
              await deleteBranch({ storeId, id: branch.id }).unwrap();
              notify.success("Branch removed");
            } catch (err) {
              notify.error("Couldn't remove branch", { message: getErrorMessage(err) });
              throw err;
            }
          }}
          close={close}
        />
      ),
      { side: "center", width: "sm" },
    );
  }

  return (
    <SettingsCard className="p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <CardHeading title="Branches" description="Other places shoppers can pick up from. Each one gets its own pin on the map." />
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => openForm()}
            className="h-11 rounded-xl bg-corisio-blue px-5 text-sm font-medium text-white transition hover:brightness-110"
          >
            Add branch
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-500">No branches yet.</p>
      ) : (
        <ul className="mt-2 divide-y divide-neutral-100">
          {items.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  {b.label}
                  {b.isDefault && (
                    <span className="rounded-full bg-corisio-100 px-2 py-0.5 text-[11px] font-medium text-corisio-500">Default</span>
                  )}
                </p>
                <p className="mt-0.5 truncate text-sm text-neutral-500">
                  {b.address}, {b.region}
                </p>
              </div>
              {canEdit && (
                <div className="flex items-center gap-4 text-sm">
                  <button type="button" onClick={() => openForm(b)} className="rounded font-semibold text-corisio-blue hover:underline">
                    Edit
                  </button>
                  <button type="button" onClick={() => confirmDelete(b)} className="rounded font-semibold text-red-600 hover:underline">
                    Remove
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </SettingsCard>
  );
}
