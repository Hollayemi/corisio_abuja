"use client";

import { useState } from "react";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useCreateProductMutation, useListCategoriesQuery, useUpdateProductMutation } from "@/redux/slices/inventoryApi";
import type { Product, ProductStatus, VariantOption } from "@/redux/types";
import {
  ImageUploadField,
  SelectField,
  TagsField,
  TextField,
  TextareaField,
} from "./fields";
import { ModalButton, ModalHeader } from "./ModalHeader";

const VARIANT_OPTIONS = [
  { label: "Standalone product (no variants)", value: "NONE" },
  { label: "Parent product (has variants)", value: "PARENT" },
];

const UNIT_TYPES = ["pc", "kg", "g", "bag", "tray", "l", "ml", "pack"].map((u) => ({
  label: u,
  value: u,
}));

const STATUS_OPTIONS: { label: string; value: ProductStatus }[] = [
  { label: "Active", value: "ACTIVE" },
  { label: "Draft", value: "DRAFT" },
  { label: "Inactive", value: "INACTIVE" },
];

/** "New Product" / edit form (design image 3), opened from the Inventory page's "Add Product" button. */
export function ProductFormDialog({
  product,
  close,
}: {
  /** Omit to create a new product */
  product?: Product;
  close: () => void;
}) {
  const { data: categoriesData, isLoading: categoriesLoading } = useListCategoriesQuery();
  const categories = categoriesData?.data.items ?? [];

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const loading = creating || updating;

  const [variantOption, setVariantOption] = useState<VariantOption>(
    product?.variantOption ?? "NONE",
  );
  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [images, setImage] = useState<File[] | null>(null);
  const [imageError, setImageError] = useState("");
  const [unitType, setUnitType] = useState(product?.unitType ?? "");
  const [unitPrice, setUnitPrice] = useState(
    product ? String(product.unitPrice) : "",
  );
  const [weight, setWeight] = useState(product?.weight ? String(product.weight) : "");
  const [stock, setStock] = useState(product ? String(product.stock) : "");
  const [reorderLevel, setReorderLevel] = useState(
    product ? String(product.reorderLevel) : "",
  );
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "ACTIVE");
  const [tags, setTags] = useState<string[]>(product?.tags ?? []);
  const [error, setError] = useState("");

  const valid =
    name.trim().length >= 2 &&
    categoryId.length > 0 &&
    unitType.length > 0 &&
    unitPrice.trim().length > 0 &&
    Number(unitPrice) >= 0 &&
    (product || (stock.trim().length > 0 && Number(stock) >= 0)) &&
    status.length > 0;

  async function handleSave() {
    if (!valid || loading) return;
    setError("");

    const body = {
      variantOption,
      name: name.trim(),
      categoryId,
      description: description.trim() || undefined,
      images,
      unitType,
      unitPrice: Number(unitPrice),
      weight: weight.trim() ? Number(weight) : undefined,
      reorderLevel: reorderLevel.trim() ? Number(reorderLevel) : 0,
      status,
      tags,
    };
    console.log(body)

    try {
      if (product) {
        await updateProduct({ id: product.id, ...body }).unwrap();
        notify.success("Product updated", { message: `"${name}" was saved.` });
      } else {
        await createProduct({ ...body, stock: Number(stock) }).unwrap();
        notify.success("Product created", { message: `"${name}" was added to the catalog.` });
      }
      close();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <ModalHeader
        title="New Product"
        onBack={close}
        actions={
          <ModalButton onClick={handleSave} disabled={!valid} loading={loading}>
            <SaveIcon /> Save
          </ModalButton>
        }
      />

      <div className="max-h-[calc(90dvh-73px)] overflow-y-auto px-6 py-6 sm:px-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              {product ? "Edit Product" : "Add New Product"}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              {product
                ? "Update this product's pricing, inventory and storefront details."
                : "Add a product to your Luxol catalog and manage its pricing, inventory and storefront details."}
            </p>
          </div>
          {product && (
            <span className="shrink-0 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-500">
              {product.productId}
            </span>
          )}
        </div>

        <div className="grid gap-x-10 gap-y-5 lg:grid-cols-2">
          <div className="space-y-5">
            <SelectField
              label="Variant Option"
              hint="Choose if it will have variants or it will be a parent product"
              value={variantOption}
              onChange={(v) => setVariantOption(v as VariantOption)}
              options={VARIANT_OPTIONS}
              placeholder="Select the variant option"
            />
            <TextField
              label="Product Name"
              value={name}
              onChange={setName}
              placeholder="e.g. Premium Beef"
              required
            />
            {product && (
              <TextField label="Product ID" value={product.productId} onChange={() => {}} readOnly />
            )}
            <SelectField
              label="Category"
              value={categoryId}
              onChange={setCategoryId}
              options={categories.map((c: any) => ({ label: c.name, value: c.id }))}
              placeholder={categoriesLoading ? "Loading categories..." : "Select the category"}
              disabled={categoriesLoading}
            />
            <TextareaField
              label="Product Description"
              hint="Describe the product for customers."
              value={description}
              onChange={setDescription}
              placeholder="Fresh premium beef, carefully selected and prepared to order. Ideal for everyday meals, soups and stews."
            />
            <ImageUploadField
              label="Product Image"
              value={images ?? []}
              onChange={(files) => setImage(files.length > 0 ? files : null)}
              error={imageError}
              maxFiles={8}
              onError={setImageError}
            />
          </div>

          <div className="space-y-5">
            <SelectField
              label="Unit Type"
              hint="Choose or type the unit of measurement used for each option."
              value={unitType}
              onChange={setUnitType}
              options={UNIT_TYPES}
              placeholder="Select the unit type"
            />
            <TextField
              label="Unit Price"
              type="number"
              min={0}
              value={unitPrice}
              onChange={setUnitPrice}
              placeholder="Enter the unit price"
              required
            />
            <TextField
              label="Weight"
              type="number"
              min={0}
              value={weight}
              onChange={setWeight}
              placeholder="Enter the weight of the item (optional)"
            />
            {product ? (
              <TextField
                label="Reorder Level"
                type="number"
                min={0}
                value={reorderLevel}
                onChange={setReorderLevel}
                placeholder="Enter the reorder level"
              />
            ) : (
              <TextField
                label="Initial Stock Amount"
                type="number"
                min={0}
                value={stock}
                onChange={setStock}
                placeholder="Enter the stock amount"
                required
              />
            )}
            <SelectField
              label="Product Status"
              hint="Active products are visible and available for purchase."
              value={status}
              onChange={(v) => setStatus(v as ProductStatus)}
              options={STATUS_OPTIONS}
              placeholder="Select the product status"
            />
            <TagsField
              label="Product Tags"
              hint="Add keywords to improve search filtering and automated store rules."
              value={tags}
              onChange={setTags}
              placeholder="e.g., Chilled, Dairy, Fast-Moving, Discounted"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-6 text-sm text-red-600">
            {error}
          </p>
        )}
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
