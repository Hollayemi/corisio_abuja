"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState, type ReactNode } from "react";
import DialogHeader from "@/app/components/dialog/DialogHeader";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import {
  ChevronDownIcon,
  CloseIcon,
  DeliveryIcon,
} from "@/app/components/ui/icons";
import { formatNaira } from "@/app/utils/product";
import { getErrorMessage } from "@/redux/config/errors";
import { useAuth } from "@/lib/auth/hooks";
import { useCart } from "@/redux/hooks";
import {
  useGetDeliveryMethodsQuery,
  usePlaceOrderMutation,
  useSyncCartMutation,
  useValidateCartMutation,
  useValidatePromoMutation,
} from "@/redux/slices/cartApi";
import { MAX_QUANTITY } from "@/redux/slices/cartSlice";
import { useListAddressesQuery } from "@/redux/slices/usersApi";
import { type CartItem, type PromoInfo, type StoreCartGroup } from "@/redux/types";
import { DELIVERY_METHODS } from "@/redux/types/checkout";
import type { Address } from "@/redux/types/users";

const fieldClass =
  "h-[52px] w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-corisio-blue focus:outline-none focus:ring-2 focus:ring-corisio-blue/30";

const labelClass = "text-sm font-semibold text-neutral-900";

const primaryButton =
  "inline-flex h-12 w-full items-center justify-center rounded-lg bg-corisio-blue px-6 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue disabled:cursor-not-allowed disabled:opacity-60";

const outlineButton =
  "inline-flex h-12 w-full items-center justify-center rounded-lg border border-neutral-300 bg-white px-6 text-sm font-medium text-neutral-900 transition hover:border-corisio-blue hover:text-corisio-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue";

/** "Jane Doe, 12 Allen Ave, Ikeja" — the single line shown for a saved address */
function addressLine(a: Address) {
  return [a.fullName, a.address, a.region].filter(Boolean).join(", ");
}

/* ------------------------------------------------------------------ */
/* Entry point: decides which view to show                             */
/* ------------------------------------------------------------------ */

export default function CartDrawer() {
  const cart = useCart();

  if (cart.items.length === 0) return <EmptyCart />;
  return <CartContents />;
}

/* ------------------------------------------------------------------ */
/* Empty                                                               */
/* ------------------------------------------------------------------ */

function EmptyCart() {
  const { closeDialog } = useDialog();

  return (
    <div className="flex h-full flex-col">
      <DialogHeader title="Your Cart" />

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pb-20 text-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-14 text-neutral-400"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>

        <p className="text-sm text-neutral-500">Your cart is empty</p>

        <Link
          href="/shop"
          onClick={closeDialog}
          className={`${primaryButton} mt-3 w-auto px-8`}
        >
          Start Shopping
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cart with items: delivery details, then one section per store       */
/* ------------------------------------------------------------------ */

type SharedErrors = { address?: string; phone?: string };

function CartContents() {
  const cart = useCart();
  const { closeDialog } = useDialog();

  // Address and receiver phone are the same whichever store you check out from
  const [addressId, setAddressId] = useState(cart.addressId ?? "");
  const [sharedErrors, setSharedErrors] = useState<SharedErrors>({});

  // Store sections open/closed. The first store starts open; the rest start closed.
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const isOpen = (storeId: string, index: number) => open[storeId] ?? index === 0;

  /** Checks the shared details; a store's Checkout button calls this first. */
  function validateShared() {
    const next: SharedErrors = {};
    if (!addressId) next.address = "Select a delivery address.";
    if (cart.phone.replace(/\D/g, "").length < 10) {
      next.phone = "Enter a valid phone number.";
    }
    setSharedErrors(next);
    return Object.keys(next).length === 0;
  }

  const storeCount = cart.groups.length;

  return (
    <div className="flex h-full flex-col">
      <DialogHeader title={`Your Cart (${cart.count})`} />

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {/* Delivery details: shared by every store */}
        <div className="space-y-8 pt-2">
          <AddressSection
            selectedId={addressId}
            error={sharedErrors.address}
            onSelect={(id) => {
              setAddressId(id);
              setSharedErrors((e) => ({ ...e, address: undefined }));
            }}
          />

          <div>
            <label htmlFor="cart-phone" className={labelClass}>
              Receiver&rsquo;s Phone Number
            </label>
            <input
              id="cart-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={cart.phone}
              onChange={(e) => {
                cart.setPhone(e.target.value);
                setSharedErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              placeholder="Enter receiver's phone number"
              aria-invalid={sharedErrors.phone ? true : undefined}
              aria-describedby={sharedErrors.phone ? "cart-phone-error" : undefined}
              className={`${fieldClass} mt-3`}
            />
            {sharedErrors.phone && (
              <p id="cart-phone-error" role="alert" className="mt-2 text-xs text-red-600">
                {sharedErrors.phone}
              </p>
            )}
          </div>
        </div>

        <hr className="my-8 border-neutral-200" />

        <p className="text-sm text-neutral-600">
          {storeCount > 1
            ? `You're buying from ${storeCount} stores. Each store is a separate order: choose its delivery method and check out below.`
            : "Choose a delivery method and check out below."}
        </p>

        <div className="mt-4 space-y-4">
          {cart.groups.map((group, index) => (
            <StoreSection
              key={group.storeId}
              group={group}
              expanded={isOpen(group.storeId, index)}
              onToggle={() =>
                setOpen((prev) => ({ ...prev, [group.storeId]: !isOpen(group.storeId, index) }))
              }
              addressId={addressId}
              validateShared={validateShared}
            />
          ))}
        </div>

        <button type="button" onClick={closeDialog} className={`${outlineButton} mt-8`}>
          Back to Shopping
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* One store: collapsible header, its items, and its own checkout       */
/* ------------------------------------------------------------------ */

type StoreErrors = { method?: string };

function StoreAvatar({ group }: { group: StoreCartGroup }) {
  if (group.storeLogo) {
    return (
      <span className="relative size-10 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-white">
        <Image src={group.storeLogo} alt="" fill sizes="40px" className="object-cover" />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-corisio-blue/10 text-sm font-bold text-corisio-blue"
    >
      {group.storeName.trim().charAt(0).toUpperCase() || "S"}
    </span>
  );
}

function StoreSection({
  group,
  expanded,
  onToggle,
  addressId,
  validateShared,
}: {
  group: StoreCartGroup;
  expanded: boolean;
  onToggle: () => void;
  addressId: string;
  validateShared: () => boolean;
}) {
  const cart = useCart();
  const { isAuthenticated } = useAuth();
  const [placeOrder] = usePlaceOrderMutation();
  const [validateCart] = useValidateCartMutation();
  const [syncCart] = useSyncCartMutation();

  const panelId = useId();
  const methodId = useId();

  // This store's own delivery methods (falls back to the static list)
  const { data: deliveryMethodsData } = useGetDeliveryMethodsQuery(group.storeId, {
    skip: !expanded,
  });
  const deliveryMethods = deliveryMethodsData?.data ?? DELIVERY_METHODS;

  const [errors, setErrors] = useState<StoreErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const method = deliveryMethods.find((m) => m.id === group.deliveryMethod);
  const percentOff = group.promo?.percentOff ?? 0;
  const discount = Math.round((group.itemsTotal * percentOff) / 100);
  const deliveryFee = method?.fee ?? 0;
  const total = group.itemsTotal - discount + deliveryFee;

  async function handleCheckout() {
    const next: StoreErrors = {};
    if (!method) next.method = "Select a delivery method.";

    setErrors(next);
    setSubmitError("");

    const sharedOk = validateShared();
    if (!sharedOk) {
      setSubmitError(
        "Add your delivery address and receiver's phone number at the top of your cart.",
      );
    }
    if (Object.keys(next).length > 0 || !sharedOk) return;

    setSubmitting(true);
    try {
      // The server prices the order, so only ids and quantities are sent
      const items = group.items.map((i: CartItem) => ({
        productId: i.id,
        quantity: i.quantity,
        variant: i.variant,
      }));

      // Signed-in customers get this store's cart saved to the account before
      // checkout (so it's there if they switch devices, and for abandoned-
      // cart recovery); best-effort, never blocks checkout.
      if (isAuthenticated) {
        syncCart({ storeId: group.storeId, items }).unwrap().catch(() => {});
      }

      // Re-check stock and current prices right before checkout — the
      // person may have had this cart open a while.
      const validation = await validateCart({ storeId: group.storeId, items }).unwrap();
      if (!validation.data.valid) {
        setSubmitError(
          validation.data.issues.map((issue) => issue.message).join(" ") ||
            "Some items in your cart changed. Please review your cart and try again.",
        );
        setSubmitting(false);
        return;
      }

      const response = await placeOrder({
        storeId: group.storeId,
        items,
        addressId,
        phone: cart.phone.trim(),
        deliveryMethod: group.deliveryMethod.toUpperCase(),
        promoCode: group.promo?.code,
      }).unwrap();

      // Only this store's items leave the cart; other stores stay for their own checkout
      cart.clearStore(group.storeId);
      window.location.assign(response.data.payment.authorizationUrl);
    } catch (err) {
      setSubmitError(
        getErrorMessage(err, "We couldn't place your order. Please try again."),
      );
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-neutral-200">
      {/* Header: tap to collapse / expand */}
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
        >
          <StoreAvatar group={group} />

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-neutral-900">
              {group.storeName}
            </span>
            <span className="block text-xs text-neutral-500">
              {group.count} {group.count === 1 ? "item" : "items"} ·{" "}
              {formatNaira(group.itemsTotal)}
            </span>
          </span>

          <ChevronDownIcon
            className={`size-4 shrink-0 text-neutral-700 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </h3>

      {expanded && (
        <div id={panelId} className="border-t border-neutral-200 px-4 pb-5">
          <ul>
            {group.items.map((item: CartItem) => (
              <CartRow key={item.key} item={item} />
            ))}
          </ul>

          <div className="mt-2 space-y-6 border-t border-neutral-200 pt-6">
            {/* Promo code (applies to this store's items only) */}
            <PromoSection
              storeId={group.storeId}
              itemsTotal={group.itemsTotal}
              promo={group.promo}
            />

            {/* Delivery method for this store */}
            <div>
              <label htmlFor={methodId} className={labelClass}>
                Select Delivery Method
              </label>
              <div className="relative mt-3">
                <select
                  id={methodId}
                  value={group.deliveryMethod}
                  onChange={(e) => {
                    cart.setDeliveryMethod(group.storeId, e.target.value);
                    setErrors((prev) => ({ ...prev, method: undefined }));
                  }}
                  aria-invalid={errors.method ? true : undefined}
                  aria-describedby={errors.method ? `${methodId}-error` : undefined}
                  className={`${fieldClass} appearance-none pr-11 ${
                    group.deliveryMethod ? "text-neutral-900" : "text-neutral-400"
                  }`}
                >
                  <option value="">Select delivery method</option>
                  {deliveryMethods.map((m) => (
                    <option key={m.id} value={m.id} className="text-neutral-900">
                      {m.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-neutral-700" />
              </div>
              {errors.method && (
                <p id={`${methodId}-error`} role="alert" className="mt-2 text-xs text-red-600">
                  {errors.method}
                </p>
              )}
            </div>

            {/* Totals for this store */}
            <dl className="space-y-3 text-xs text-neutral-600">
              <TotalRow label="Items Total" value={formatNaira(group.itemsTotal)} />
              <TotalRow label="Discount" value={formatNaira(discount)} />
              <TotalRow label="Delivery Fee" value={formatNaira(deliveryFee)} />
              <div className="flex items-center justify-between pt-3 text-sm">
                <dt className="text-neutral-700">Total</dt>
                <dd className="font-bold text-neutral-900">{formatNaira(total)}</dd>
              </div>
            </dl>

            <div className="space-y-3">
              {submitError && (
                <p role="alert" className="text-sm text-red-600">
                  {submitError}
                </p>
              )}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={submitting}
                className={primaryButton}
              >
                {submitting ? "Placing order..." : `Checkout from ${group.storeName}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function TotalRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt>{label}</dt>
      <dd className="text-neutral-800">{value}</dd>
    </div>
  );
}

function CartRow({ item }: { item: CartItem }) {
  const { removeItem, setQuantity } = useCart();

  return (
    <li className="flex items-center gap-3 border-b border-neutral-100 py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => removeItem(item.key)}
        aria-label={`Remove ${item.name}`}
        className="rounded p-1 text-neutral-500 transition hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-corisio-blue"
      >
        <CloseIcon className="size-3.5" />
      </button>

      <div className="relative size-14 shrink-0">
        <Image
          src={item.image}
          alt=""
          fill
          sizes="56px"
          className="object-contain"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm text-neutral-700" title={item.name}>
          {item.name}
        </p>
        {item.variant && (
          <p className="text-xs text-neutral-500">{item.variant}</p>
        )}
        <p className="mt-1 text-base font-bold text-neutral-900">
          {formatNaira(item.price)}
        </p>
      </div>

      <div className="inline-flex h-9 shrink-0 items-center rounded-full border border-neutral-200 px-1">
        <button
          type="button"
          onClick={() => setQuantity(item.key, item.quantity - 1)}
          disabled={item.quantity <= 1}
          aria-label={`Decrease quantity of ${item.name}`}
          className="flex size-7 items-center justify-center rounded-full text-base leading-none text-neutral-800 transition hover:bg-neutral-100 disabled:opacity-40"
        >
          −
        </button>
        <span
          aria-live="polite"
          className="min-w-7 px-1 text-center text-sm text-neutral-900"
        >
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity(item.key, item.quantity + 1)}
          disabled={item.quantity >= MAX_QUANTITY}
          aria-label={`Increase quantity of ${item.name}`}
          className="flex size-7 items-center justify-center rounded-full text-base leading-none text-neutral-800 transition hover:bg-neutral-100 disabled:opacity-40"
        >
          +
        </button>
      </div>
    </li>
  );
}

/**
 * Delivery address: a dropdown of the customer's saved addresses (the same
 * address book they manage on /account?tab=address), with an "Add Address"
 * link underneath for creating a new one.
 */
export function AddressSection({
  selectedId,
  error,
  onSelect,
}: {
  selectedId: string;
  error?: string;
  onSelect: (id: string) => void;
}) {
  const cart = useCart();
  const { closeDialog } = useDialog();
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useListAddressesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const addresses = data?.data ?? [];

  function choose(a: Address) {
    onSelect(a.id);
    cart.setAddress(addressLine(a));
    // Saved addresses carry a phone number: prefill the receiver's if empty
    if (!cart.phone.trim() && a.phone) cart.setPhone(a.phone);
  }

  // Once the list loads, keep a valid selection: the previously chosen
  // address if it still exists, otherwise the first one.
  useEffect(() => {
    if (addresses.length === 0) return;
    const current = addresses.find((a) => a.id === selectedId);
    if (!current) choose(addresses[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses, selectedId]);

  const placeholder = !isAuthenticated
    ? "Sign in to choose a saved address"
    : isLoading
      ? "Loading addresses..."
      : addresses.length === 0
        ? "No saved addresses yet"
        : "Select delivery address";

  return (
    <div>
      <label
        htmlFor="cart-address"
        className="flex items-center gap-2 text-sm font-semibold text-neutral-900"
      >
        <DeliveryIcon className="size-4" />
        Delivering to:
      </label>

      <div className="relative mt-3">
        <select
          id="cart-address"
          value={addresses.some((a) => a.id === selectedId) ? selectedId : ""}
          disabled={!isAuthenticated || isLoading || addresses.length === 0}
          onChange={(e) => {
            const a = addresses.find((x) => x.id === e.target.value);
            if (a) choose(a);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "cart-address-error" : undefined}
          className={`${fieldClass} appearance-none truncate pr-11 disabled:cursor-not-allowed disabled:opacity-70 ${
            selectedId ? "text-neutral-900" : "text-neutral-400"
          }`}
        >
          <option value="">{placeholder}</option>
          {addresses.map((a) => (
            <option key={a.id} value={a.id} className="text-neutral-900">
              {addressLine(a)}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-neutral-700" />
      </div>

      {error && (
        <p id="cart-address-error" role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}

      <Link
        href="/account?tab=address"
        onClick={closeDialog}
        className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-[#e6f3e4] px-4 text-sm font-medium text-corisio-blue transition hover:brightness-95"
      >
        <span aria-hidden="true">+</span> Add Address
      </Link>
    </div>
  );
}

/** Promo code for ONE store's items. */
function PromoSection({
  storeId,
  itemsTotal,
  promo,
}: {
  storeId: string;
  itemsTotal: number;
  promo: PromoInfo | null;
}) {
  const cart = useCart();
  const inputId = useId();
  const [validatePromo, { isLoading }] = useValidatePromoMutation();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const percentOff = promo?.percentOff ?? 0;

  async function apply() {
    const code = input.trim().toUpperCase();
    if (!code || isLoading) return;

    try {
      const response = await validatePromo({ storeId, code, itemsTotal }).unwrap();

      cart.setPromo(storeId, response.data);
      setInput("");
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "That promo code isn't valid."));
    }
  }

  return (
    <div>
      <label htmlFor={inputId} className={labelClass}>
        Add Promo Code (Optional)
      </label>

      {promo ? (
        <div className="mt-3 flex h-[52px] items-center justify-between rounded-lg border border-corisio-blue/40 bg-[#e6f3e4] px-4">
          <p className="text-sm text-corisio-blue">
            <span className="font-semibold">{promo.code}</span> applied
            {percentOff > 0 ? ` · ${percentOff}% off` : ""}
          </p>
          <button
            type="button"
            onClick={() => cart.setPromo(storeId, null)}
            className="text-xs font-medium text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
          >
            Remove
          </button>
        </div>
      ) : (
        <>
          <div className="relative mt-3">
            <input
              id={inputId}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  apply();
                }
              }}
              placeholder="Enter promo code"
              autoCapitalize="characters"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${inputId}-error` : undefined}
              className={`${fieldClass} pr-24`}
            />
            <button
              type="button"
              onClick={apply}
              disabled={isLoading}
              className="absolute right-3 top-1/2 h-8 -translate-y-1/2 rounded-md bg-[#e6f3e4] px-3 text-xs font-medium text-corisio-blue transition hover:brightness-95 disabled:opacity-60"
            >
              {isLoading ? "Checking..." : "Apply"}
            </button>
          </div>
          {error && (
            <p id={`${inputId}-error`} role="alert" className="mt-2 text-xs text-red-600">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
