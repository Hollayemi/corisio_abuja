"use client";

import { useState } from "react";
import {
  ImageUploadField,
  SelectField,
  TextareaField,
  TextField,
} from "@/app/components/admin/inventory/fields";
import { ModalButton, ModalHeader } from "@/app/components/admin/inventory/ModalHeader";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useCreateAdminProteinMutation,
  useUpdateAdminProteinMutation,
} from "@/redux/slices/adminMembershipApi";
import type { AdminActiveStatus, AdminProtein } from "@/redux/types";
import { ACTIVE_STATUS_OPTIONS } from "./formatters";

export type ProteinFormDialogProps = {
  /** Omit to add a new protein. */
  protein?: AdminProtein;
  close: () => void;
};

/** "Add Protein" / "Edit Protein" dialog: image, label, description and status. */
export function ProteinFormDialog({ protein, close }: ProteinFormDialogProps) {
  const [createProtein, { isLoading: creating }] = useCreateAdminProteinMutation();
  const [updateProtein, { isLoading: updating }] = useUpdateAdminProteinMutation();
  const loading = creating || updating;

  const [label, setLabel] = useState(protein?.label ?? "");
  const [description, setDescription] = useState(protein?.description ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [status, setStatus] = useState<AdminActiveStatus>(protein?.status ?? "active");
  const [imageError, setImageError] = useState("");
  const [error, setError] = useState("");

  // A new protein needs a picture; when editing, keeping the current one is fine.
  const hasImage = !!image || !!protein?.image;
  const valid = label.trim().length >= 2 && description.trim().length > 0 && hasImage;

  async function handleSave() {
    if (!valid || loading) return;
    setError("");

    const body = {
      label: label.trim(),
      description: description.trim(),
      image,
      status,
    };

    try {
      if (protein) {
        await updateProtein({ id: protein.id, ...body }).unwrap();
        notify.success("Protein updated", { message: `"${body.label}" was saved.` });
      } else {
        await createProtein(body).unwrap();
        notify.success("Protein added", { message: `Members can now mix "${body.label}" into their deliveries.` });
      }
      close();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <ModalHeader
        title={protein ? "Edit Protein" : "Add Protein"}
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
            {protein ? "Edit protein" : "Add a protein"}
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Members pick from these proteins to mix into their deliveries.
          </p>
        </div>

        <div className="space-y-5">
          <TextField label="Label" value={label} onChange={setLabel} placeholder="e.g. Chicken" required />

          <TextareaField
            label="Description"
            hint="A short line members see when choosing this protein."
            value={description}
            onChange={setDescription}
            rows={3}
            maxLength={200}
            placeholder="Farm-fresh chicken, cleaned and portioned."
          />

          <div>
            {protein?.image && !image && (
              <div className="mb-3 flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={protein.image} alt="" className="size-14 rounded-lg object-cover" />
                <p className="text-xs text-neutral-500">
                  Current image. Upload a new one below to replace it.
                </p>
              </div>
            )}
            <ImageUploadField
              label="Protein Image"
              hint="SVG, PNG, JPG, GIF or WebP, up to 5MB"
              value={image ? [image] : []}
              // The last file picked wins, so choosing again replaces the first choice
              onChange={(files) => setImage(files[files.length - 1] ?? null)}
              error={imageError}
              onError={setImageError}
              maxFiles={2}
            />
          </div>

          <SelectField
            label="Status"
            hint="Inactive proteins can't be picked in new mixes."
            value={status}
            onChange={(v) => setStatus(v as AdminActiveStatus)}
            options={ACTIVE_STATUS_OPTIONS}
          />

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
