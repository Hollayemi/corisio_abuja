"use client";

import { useState } from "react";
import { ModalButton, ModalHeader } from "./ModalHeader";
import { ImageUploadField, SelectField, TextareaField, TextField } from "./fields";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/redux/slices/inventoryApi";
import type { Category, CategoryStatus } from "@/redux/types";

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

/**
 * "Add New Category" / edit form (design image 2). Reached from
 * CategoryListDialog with a Back arrow, so `onBack` returns to that list
 * rather than closing the whole modal.
 */
export function CategoryFormDialog({
  category,
  onBack,
}: {
  /** Omit to create a new category */
  category?: Category;
  onBack: () => void;
}) {
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const loading = creating || updating;

  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [status, setStatus] = useState<CategoryStatus>(category?.status ?? "ACTIVE");
  const [displayOrder, setDisplayOrder] = useState(String(category?.displayOrder ?? ""));
  const [imageError, setImageError] = useState("");
  const [error, setError] = useState("");

  const valid = name.trim().length >= 2 && displayOrder.trim().length > 0;

  async function handleSave() {
    if (!valid || loading) return;
    setError("");

    const body = {
      name: name.trim(),
      description: description.trim() || undefined,
      image,
      status,
      displayOrder: Number(displayOrder),
    };

    try {
      if (category) {
        await updateCategory({ id: category.id, ...body }).unwrap();
        notify.success("Category updated", { message: `"${name}" was saved.` });
      } else {
        await createCategory(body).unwrap();
        notify.success("Category created", { message: `"${name}" was added to the catalog.` });
      }
      onBack();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <ModalHeader
        title="Product Categories"
        onBack={onBack}
        actions={
          <ModalButton onClick={handleSave} disabled={!valid} loading={loading}>
            <SaveIcon /> Save
          </ModalButton>
        }
      />

      <div className="max-h-[calc(90dvh-73px)] overflow-y-auto px-6 py-6 sm:px-8">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-neutral-900">
            {category ? "Edit Category" : "Add New Category"}
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            {category
              ? "Update this category's details."
              : "Create a category to organize products in the Luxol catalog."}
          </p>
        </div>

        <div className="space-y-5">
          <TextField
            label="Category Name"
            value={name}
            onChange={setName}
            placeholder="e.g. Dairy & Eggs"
            required
          />
          <TextareaField
            label="Category Description"
            hint="Briefly describe what customers can find in this category."
            value={description}
            onChange={setDescription}
            placeholder="Fresh dairy products, eggs and everyday essentials for your home."
          />
          <ImageUploadField
            value={image ? [image] : []}
            onChange={(files) => setImage(files[0] ?? null)}
            error={imageError}
            onError={setImageError}
          />
          <SelectField
            label="Category Status"
            value={status}
            onChange={(v) => setStatus(v as CategoryStatus)}
            options={STATUS_OPTIONS}
          />
          <TextField
            label="Display Order"
            hint="Determines the order this category appears in the shop."
            type="number"
            min={0}
            value={displayOrder}
            onChange={setDisplayOrder}
            placeholder="e.g. 1"
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
