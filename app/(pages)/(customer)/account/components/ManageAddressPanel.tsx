"use client";

import { useRef, useState, type FormEvent } from "react";
import { getErrorMessage } from "@/redux/config/errors";
import type { Address } from "@/redux/types";
import {
  useAddAddressMutation,
  useDeleteAddressMutation,
  useListAddressesQuery,
  useUpdateAddressMutation,
} from "@/redux/slices/usersApi";
import { NIGERIAN_STATES } from "@/app/data/account-data";
import { PhoneField, SelectField, TextField } from "./fields";
import { FormError, PanelError, PanelSkeleton } from "./PanelState";

const primaryButton =
  "inline-flex h-[52px] w-full items-center justify-center rounded-xl bg-corisio-blue px-6 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue disabled:cursor-not-allowed disabled:opacity-60";

const EMPTY_DRAFT = {
  fullName: "",
  address: "",
  region: "",
  phone: "",
  phone_sec: "",
};

export default function ManageAddressPanel() {
  const { data, isLoading, error, refetch } = useListAddressesQuery();
  const addresses = data?.data ?? [];

  const [addAddress, { isLoading: adding }] = useAddAddressMutation();
  const [updateAddress, { isLoading: updating }] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const saving = adding || updating;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function startEdit(address: Address) {
    setEditingId(address.id);
    setFormError("");
    setDraft({
      fullName: address.fullName,
      address: address.address,
      region: address.region,
      phone: address.phone,
      phone_sec: address.phone_sec ?? "",
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setFormError("");
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this address?")) return;
    setDeletingId(id);
    try {
      await deleteAddress(id).unwrap();
      if (editingId === id) cancelEdit();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!draft.fullName || !draft.address || !draft.region || !draft.phone) return;

    try {
      if (editingId) {
        await updateAddress({ id: editingId, ...draft }).unwrap();
      } else {
        await addAddress(draft).unwrap();
      }
      cancelEdit();
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-neutral-900">Manage Address</h2>

      {isLoading && (
        <div className="mt-6 max-w-[640px]">
          <PanelSkeleton rows={2} />
        </div>
      )}

      {!isLoading && error && (
        <div className="mt-6">
          <PanelError message={getErrorMessage(error)} onRetry={refetch} />
        </div>
      )}

      {!isLoading && !error && (
        <>
          {addresses.length > 0 && (
            <div className="mt-6 divide-y divide-neutral-100 rounded-2xl border border-neutral-200">
              {addresses.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900">{a.fullName}</p>
                    <p className="mt-1 text-sm text-neutral-500">{a.address}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 text-sm font-semibold">
                    <button
                      type="button"
                      onClick={() => startEdit(a)}
                      className="text-corisio-blue hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(a.id)}
                      disabled={deletingId === a.id}
                      className="text-corisio-yellow hover:underline disabled:opacity-60"
                    >
                      {deletingId === a.id ? "Removing…" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            ref={formRef}
            className={addresses.length > 0 ? "mt-10 max-w-[640px]" : "mt-6 max-w-[640px]"}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <TextField
                label="Delivery Address"
                placeholder="Enter your address"
                value={draft.address}
                onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
                required
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  label="Region"
                  hint="We use this to calculate delivery fees and estimated delivery time."
                  value={draft.region}
                  onChange={(e) => setDraft((d) => ({ ...d, region: e.target.value }))}
                  required
                >
                  <option value="" disabled>
                    Select a state
                  </option>
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </SelectField>

                <TextField
                  label="Full Name"
                  placeholder="Recipient's full name"
                  value={draft.fullName}
                  onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))}
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <PhoneField
                  label="Phone Number"
                  placeholder="Enter number"
                  value={draft.phone}
                  onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                  required
                />
                <PhoneField
                  label="Additional Phone Number"
                  placeholder="Enter number"
                  value={draft.phone_sec}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, phone_sec: e.target.value }))
                  }
                />
              </div>

              <FormError message={formError} />

              <button type="submit" disabled={saving} className={primaryButton}>
                {saving ? "Saving…" : editingId ? "Save Changes" : "Add Address"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="self-start text-sm font-semibold text-neutral-500 hover:text-neutral-700"
                >
                  Cancel editing
                </button>
              )}
            </form>
          </div>
        </>
      )}
    </div>
  );
}
