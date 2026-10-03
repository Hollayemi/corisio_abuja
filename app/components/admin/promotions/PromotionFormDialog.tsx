"use client";

import { useState } from "react";
import { Field, SelectField, TextField } from "@/app/components/admin/inventory/fields";
import { ModalButton, ModalHeader } from "@/app/components/admin/inventory/ModalHeader";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useListCategoriesQuery, useListProductsQuery } from "@/redux/slices/inventoryApi";
import {
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
} from "@/redux/slices/promotionsApi";
import type {
  AppliesTo,
  DiscountType,
  Promotion,
  PromotionType,
} from "@/redux/types";
import { toDateTimeLocal } from "./formatters";

const DISCOUNT_TYPE_OPTIONS: { label: string; value: DiscountType }[] = [
  { label: "Percentage Discount", value: "PERCENTAGE" },
  { label: "Fixed Amount Off", value: "FIXED_AMOUNT" },
  { label: "Free Delivery", value: "FREE_DELIVERY"},
];

const APPLIES_TO_OPTIONS: { label: string; value: AppliesTo }[] = [
  { label: "All Orders", value: "ALL_ORDERS" },
  { label: "Category", value: "CATEGORY" },
  { label: "Specific Products", value: "SPECIFIC_PRODUCTS" },
];

function discountPlaceholder(type: DiscountType) {
  return type === "PERCENTAGE" ? "e.g. 15 %" : type === "FIXED_AMOUNT" ? "e.g. 5,000" : "N/A for free delivery";
}

/** "New Promotion" / edit form (design image 3), opened from the Promotions page. */
export function PromotionFormDialog({
  promotion,
  close,
}: {
  /** Omit to create a new promotion */
  promotion?: Promotion;
  close: () => void;
}) {
  const [createPromotion, { isLoading: creating }] = useCreatePromotionMutation();
  const [updatePromotion, { isLoading: updating }] = useUpdatePromotionMutation();
  const loading = creating || updating;

  const { data: categoriesData } = useListCategoriesQuery();
  const categories = categoriesData?.data.items ?? [];

  const [type, setType] = useState<PromotionType>(promotion?.type ?? "DISCOUNT_DEAL");
  const [name, setName] = useState(promotion?.name ?? "");
  const [discountType, setDiscountType] = useState<DiscountType>(
    promotion?.discountType ?? "PERCENTAGE",
  );
  const [discountValue, setDiscountValue] = useState(
    promotion ? String(promotion.discountValue) : "",
  );
  const [appliesTo, setAppliesTo] = useState<AppliesTo>(promotion?.appliesTo ?? "ALL_ORDERS");
  const [categoryId, setCategoryId] = useState(promotion?.categoryId ?? "");
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    promotion?.productIds ?? [],
  );
  const [minimumOrderAmount, setMinimumOrderAmount] = useState(
    promotion?.minimumOrderAmount ? String(promotion.minimumOrderAmount) : "",
  );
  const [maximumDiscount, setMaximumDiscount] = useState(
    promotion?.maximumDiscount ? String(promotion.maximumDiscount) : "",
  );
  const [usageLimit, setUsageLimit] = useState(
    promotion?.usageLimit ? String(promotion.usageLimit) : "",
  );
  const [limitPerCustomer, setLimitPerCustomer] = useState(
    promotion?.limitPerCustomer ? String(promotion.limitPerCustomer) : "",
  );
  const [startAt, setStartAt] = useState(toDateTimeLocal(promotion?.startAt));
  const [endAt, setEndAt] = useState(toDateTimeLocal(promotion?.endAt));
  const [error, setError] = useState("");

  const { data: productsData } = useListProductsQuery(
    appliesTo === "SPECIFIC_PRODUCTS" ? { search: productSearch, perPage: 6 } : undefined,
    { skip: appliesTo !== "SPECIFIC_PRODUCTS" },
  );
  const productResults = productsData?.data.items ?? [];

  const valid =
    name.trim().length >= 2 &&
    (discountType === "FREE_DELIVERY" || discountValue.trim().length > 0) &&
    (appliesTo !== "CATEGORY" || categoryId.length > 0) &&
    (appliesTo !== "SPECIFIC_PRODUCTS" || selectedProductIds.length > 0) &&
    startAt.length > 0;

  async function handleSave() {
    if (!valid || loading) return;
    setError("");

    const body = {
      type,
      name: name.trim(),
      discountType,
      discountValue: discountType === "FREE_DELIVERY" ? 0 : Number(discountValue),
      appliesTo,
      categoryId: appliesTo === "CATEGORY" ? categoryId : undefined,
      productIds: appliesTo === "SPECIFIC_PRODUCTS" ? selectedProductIds : undefined,
      minimumOrderAmount: minimumOrderAmount.trim() ? Number(minimumOrderAmount) : undefined,
      maximumDiscount: maximumDiscount.trim() ? Number(maximumDiscount) : undefined,
      usageLimit: usageLimit.trim() ? Number(usageLimit) : undefined,
      limitPerCustomer: limitPerCustomer.trim() ? Number(limitPerCustomer) : undefined,
      startAt: new Date(startAt).toISOString(),
      endAt: endAt.trim() ? new Date(endAt).toISOString() : undefined,
    };

    try {
      if (promotion) {
        await updatePromotion({ id: promotion.id, ...body }).unwrap();
        notify.success("Promotion updated", { message: `"${name}" was saved.` });
      } else {
        await createPromotion(body).unwrap();
        notify.success("Promotion created", { message: `"${name}" is now live in the catalog.` });
      }
      close();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <ModalHeader
        title={promotion ? "Edit Promotion" : "New Promotion"}
        onBack={close}
        actions={
          <ModalButton onClick={handleSave} disabled={!valid} loading={loading}>
            <SaveIcon /> Save
          </ModalButton>
        }
      />

      <div className="max-h-[calc(90dvh-73px)] overflow-y-auto px-6 py-6 sm:px-8">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-neutral-900">
            {promotion ? "Edit Promotion" : "Create New Promotion"}
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            {promotion
              ? "Update this promotion's discount and rules."
              : "Create a promotion for products in the Luxol catalog."}
          </p>
        </div>

        <div className="space-y-5">
          <Field label="Promotion Type" hint="Select how you want to offer the promotion to customers." htmlFor="promo-type">
            <div id="promo-type" className="grid grid-cols-2 gap-3">
              <TypeCard
                label="Discount Deal"
                description="Apply a discount automatically to eligible products or orders."
                selected={type === "DISCOUNT_DEAL"}
                onClick={() => setType("DISCOUNT_DEAL")}
              />
              <TypeCard
                label="Coupon Code"
                description="Create a code customers can enter at checkout to redeem a specific offer."
                selected={type === "COUPON_CODE"}
                onClick={() => setType("COUPON_CODE")}
              />
            </div>
          </Field>

          <TextField
            label="Promotion Name"
            value={name}
            onChange={setName}
            placeholder="e.g. Weekend Fresh Picks"
            required
          />

          <SelectField
            label="Discount Type"
            value={discountType}
            onChange={(v) => setDiscountType(v as DiscountType)}
            options={DISCOUNT_TYPE_OPTIONS}
          />

          {discountType !== "FREE_DELIVERY" && (
            <TextField
              label="Discount Value"
              type="number"
              min={0}
              value={discountValue}
              onChange={setDiscountValue}
              placeholder={discountPlaceholder(discountType)}
              required
            />
          )}

          <SelectField
            label="Applies To"
            value={appliesTo}
            onChange={(v) => setAppliesTo(v as AppliesTo)}
            options={APPLIES_TO_OPTIONS}
          />

          {appliesTo === "CATEGORY" && (
            <SelectField
              label="Category"
              value={categoryId}
              onChange={setCategoryId}
              options={categories.map((c:any) => ({ label: c.name, value: c.id }))}
              placeholder="Select the category"
            />
          )}

          {appliesTo === "SPECIFIC_PRODUCTS" && (
            <Field label="Selected Products" htmlFor="promo-products">
              <div className="rounded-lg bg-neutral-100 p-3">
                <input
                  id="promo-products"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search for products and select them"
                  className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
                {selectedProductIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedProductIds.map((id) => {
                      const p = productResults.find((item) => item.id === id);
                      return (
                        <span
                          key={id}
                          className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs text-neutral-700"
                        >
                          {p?.name ?? id}
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedProductIds((ids) => ids.filter((i) => i !== id))
                            }
                            className="text-neutral-400 hover:text-neutral-700"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                {productSearch && productResults.length > 0 && (
                  <ul className="mt-2 max-h-40 overflow-y-auto rounded-lg bg-white">
                    {productResults
                      .filter((p) => !selectedProductIds.includes(p.id))
                      .map((p) => (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProductIds((ids) => [...ids, p.id]);
                              setProductSearch("");
                            }}
                            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-neutral-50"
                          >
                            {p.name}
                            <span className="text-xs text-neutral-400">{p.category.name}</span>
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </Field>
          )}

          <TextField
            label="Minimum Order Amount"
            hint="Customer must spend this amount to qualify."
            type="number"
            min={0}
            value={minimumOrderAmount}
            onChange={setMinimumOrderAmount}
            placeholder="e.g. 20,000"
          />
          <TextField
            label="Maximum Discount"
            hint="The max reduced amount on a particular product by discount."
            type="number"
            min={0}
            value={maximumDiscount}
            onChange={setMaximumDiscount}
            placeholder="e.g. 20,000"
          />
          <TextField
            label="Usage Limit"
            hint="This is optional and it means total numbers of usage."
            type="number"
            min={0}
            value={usageLimit}
            onChange={setUsageLimit}
            placeholder="e.g. 500 uses"
          />
          <TextField
            label="Limit Per Customer"
            type="number"
            min={0}
            value={limitPerCustomer}
            onChange={setLimitPerCustomer}
            placeholder="e.g. 2 use per customer"
          />

          <DateTimeField
            label="Start Date & Time"
            value={startAt}
            onChange={setStartAt}
            required
          />
          <DateTimeField
            label="End Date & Time"
            hint="This is optional and not putting a value means until the usage limit gets used"
            value={endAt}
            onChange={setEndAt}
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

function TypeCard({
  label,
  description,
  selected,
  onClick,
}: {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-xl border p-4 text-left transition ${
        selected
          ? "border-amber-400 bg-[#fdf6ea]"
          : "border-neutral-200 bg-white hover:border-neutral-300"
      }`}
    >
      <p className="text-sm font-semibold text-neutral-900">{label}</p>
      <p className="mt-1 text-xs leading-relaxed text-neutral-500">{description}</p>
    </button>
  );
}

function DateTimeField({
  label,
  hint,
  value,
  onChange,
  required,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <Field label={label} hint={hint} htmlFor={`dt-${label}`}>
      <input
        id={`dt-${label}`}
        type="datetime-local"
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-transparent bg-neutral-100 px-4 py-3.5 text-sm text-neutral-900 focus:border-corisio-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-corisio-blue/30"
      />
    </Field>
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
