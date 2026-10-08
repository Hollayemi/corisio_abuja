"use client";

import { useDialog } from "@/app/components/dialog/DialogProvider";
import { ConfirmDialog } from "@/app/components/admin/ConfirmDialog";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useDeleteStoreBranchMutation, useListStoreBranchesQuery } from "@/redux/slices/storeProfileApi";
import type { StoreBranch } from "@/redux/types";
import { SectionError, SectionSkeleton, SettingsCard } from "../Controls";
import { BranchFormDialog } from "./BranchFormDialog";
import { btn, CardHeading } from "./fields";

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
      ({ close }) => (
        <BranchFormDialog
          storeId={storeId}
          branch={branch}
          isFirst={items.length === 0}
          close={close}
        />
      ),
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <CardHeading
          title="Branches"
          description="Other places shoppers can pick up from. Each one gets its own pin on the map."
        />
        {canEdit && (
          <button type="button" onClick={() => openForm()} className={btn.primary + " shrink-0"}>
            + Add branch
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-neutral-700">No branches yet</p>
          <p className="mt-1 text-xs text-neutral-500">
            Add a branch if you have more than one pickup location.
          </p>
          {canEdit && (
            <button type="button" onClick={() => openForm()} className={btn.secondary + " mt-4"}>
              Add your first branch
            </button>
          )}
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((b) => (
            <li
              key={b.id}
              className="group flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-neutral-900">
                    <span className="truncate">{b.label}</span>
                    {b.isDefault && (
                      <span className="shrink-0 rounded-full bg-corisio-blue/10 px-2 py-0.5 text-[11px] font-semibold text-corisio-blue">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-neutral-500">
                    {b.address}, {b.region}
                  </p>
                </div>
              </div>

              {canEdit && (
                <div className="flex items-center gap-4 border-t border-neutral-100 pt-3 text-sm">
                  <button type="button" onClick={() => openForm(b)} className={btn.ghost}>
                    Edit
                  </button>
                  <button type="button" onClick={() => confirmDelete(b)} className={btn.ghostDanger}>
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