"use client";

import { useState } from "react";
import { ModalButton, ModalHeader } from "@/app/components/admin/inventory/ModalHeader";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useCreateStoreBranchMutation, useUpdateStoreBranchMutation } from "@/redux/slices/storeProfileApi";
import type { StoreBranch } from "@/redux/types";
import { LocationFields, locationState, type LocationDraft } from "./LocationFields";

const toDraft = (b?: StoreBranch): LocationDraft => ({
  label: b?.label ?? "",
  address: b?.address ?? "",
  region: b?.region ?? "",
  country: b?.country ?? "Nigeria",
  phone: b?.phone ?? "",
  latitude: b ? String(b.latitude) : "",
  longitude: b ? String(b.longitude) : "",
});

/** Add or edit a branch (StoreAddress). Opened with useDialog(). */
export function BranchFormDialog({
  storeId,
  branch,
  isFirst,
  close,
}: {
  storeId: string;
  /** Omit to add a new branch */
  branch?: StoreBranch;
  /** The store's first branch is always the default */
  isFirst: boolean;
  close: () => void;
}) {
  const [createBranch, { isLoading: creating }] = useCreateStoreBranchMutation();
  const [updateBranch, { isLoading: updating }] = useUpdateStoreBranchMutation();
  const loading = creating || updating;

  const [draft, setDraft] = useState<LocationDraft>(() => toDraft(branch));
  const [isDefault, setIsDefault] = useState(branch?.isDefault ?? isFirst);
  const [error, setError] = useState("");

  const { lat, lng, valid } = locationState(draft);

  async function handleSave() {
    if (!valid || loading) return;
    setError("");

    const body = {
      label: draft.label.trim(),
      address: draft.address.trim(),
      region: draft.region.trim(),
      country: draft.country.trim(),
      phone: draft.phone.trim() || null,
      latitude: lat,
      longitude: lng,
      isDefault,
    };

    try {
      if (branch) {
        await updateBranch({ storeId, id: branch.id, ...body }).unwrap();
        notify.success("Branch updated", { message: `"${body.label}" was saved.` });
      } else {
        await createBranch({ storeId, ...body }).unwrap();
        notify.success("Branch added", { message: `"${body.label}" was added.` });
      }
      close();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <ModalHeader
        title={branch ? "Edit branch" : "Add a branch"}
        onClose={close}
        actions={
          <ModalButton onClick={handleSave} disabled={!valid} loading={loading}>
            {loading ? "Saving..." : "Save"}
          </ModalButton>
        }
      />

      <div className="max-h-[calc(90dvh-73px)] overflow-y-auto px-6 py-6 sm:px-8">
        <LocationFields value={draft} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} />

        <label className="mt-6 flex items-start gap-3 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={isDefault}
            disabled={isFirst || branch?.isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="mt-0.5 size-4 accent-corisio-500"
          />
          <span>
            <span className="font-semibold text-neutral-900">Default branch</span>
            <span className="block text-xs text-neutral-500">
              Shown first to shoppers. To switch the default, tick this on the branch you want.
            </span>
          </span>
        </label>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </>
  );
}
