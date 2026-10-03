"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import DialogHeader from "@/app/components/dialog/DialogHeader";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import {
  ChevronDownIcon,
  CloseIcon,
  DeliveryIcon,
} from "@/app/components/ui/icons";
import { formatNaira } from "@/app/utils/product";
import { getErrorMessage } from "@/redux/config/errors";
import { useAppSelector, useCart } from "@/redux/hooks";
import {
  useGetDeliveryMethodsQuery,
  usePlaceOrderMutation,
  useSyncCartMutation,
  useValidateCartMutation,
  useValidatePromoMutation,
} from "@/redux/slices/cartApi";
import { MAX_QUANTITY } from "@/redux/slices/cartSlice";
import { useListAddressesQuery } from "@/redux/slices/usersApi";
import { type CartItem } from "@/redux/types";
import { DELIVERY_METHODS } from "@/redux/types/checkout";
import type { Address } from "@/redux/types/users";
import { useRouter } from "next/navigation";

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
  const [orderId, setOrderId] = useState<string | null>(null);

  if (orderId) return <OrderSuccess orderId={orderId} />;
  if (cart.items.length === 0) return <EmptyCart />;
  return <CartContents onPlaced={setOrderId} />;
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
/* Order placed                                                        */
/* ------------------------------------------------------------------ */

function OrderSuccess({ orderId }: { orderId: string }) {
  const { closeDialog } = useDialog();

  return (
    <div className="flex h-full flex-col">
      <DialogHeader title="Your Cart" />

      <div
        role="status"
        className="flex flex-1 flex-col items-center justify-center px-6 pb-20 text-center"
      >
        <svg viewBox="0 0 80 80" aria-hidden="true" className="size-20">
          <defs>
            <linearGradient id="order-ok" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#4fb04a" />
              <stop offset="1" stopColor="#86d97a" />
            </linearGradient>
          </defs>
          <rect width="80" height="80" rx="22" fill="url(#order-ok)" />
          <path
            d="M24 41l11 11 21-23"
            fill="none"
            stroke="#fff"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <h3 className="mt-8 text-xl font-bold text-neutral-900">
          Order placed successfully!
        </h3>
        <p className="mt-3 text-sm text-neutral-500">
          Thank you for shopping with Luxol.
        </p>

        <p className="mt-6 text-sm font-semibold text-neutral-900">
          Order #{orderId}
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Your order has been received and is being prepared.
        </p>

        <Link
          href={`/orders/${orderId}`}
          onClick={closeDialog}
          className={`${primaryButton} mt-8`}
        >
          Track Order
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cart with items                                                     */
/* ------------------------------------------------------------------ */

type Errors = { address?: string; phone?: string; method?: string };

function CartContents({ onPlaced }: { onPlaced: (orderId: string) => void }) {
  const router = useRouter()
  const cart = useCart();
  const { closeDialog } = useDialog();
  const isAuthenticated = useAppSelector((s) => s.session.status === "authenticated");
  const [placeOrder] = usePlaceOrderMutation();
  const [validateCart] = useValidateCartMutation();
  const [syncCart] = useSyncCartMutation();

  const { data: deliveryMethodsData } = useGetDeliveryMethodsQuery();
  const deliveryMethods = deliveryMethodsData?.data ?? DELIVERY_METHODS;

  const [addressId, setAddressId] = useState(cart.addressId ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const method = deliveryMethods.find((m) => m.id === cart.deliveryMethod);
  const percentOff = cart.promo?.percentOff ?? 0;
  const discount = Math.round((cart.itemsTotal * percentOff) / 100);
  const deliveryFee = method?.fee ?? 0;
  const total = cart.itemsTotal - discount + deliveryFee;

  async function handleCheckout() {
    const next: Errors = {};
    if (!addressId) next.address = "Select a delivery address.";
    if (cart.phone.replace(/\D/g, "").length < 10) {
      next.phone = "Enter a valid phone number.";
    }
    if (!method) next.method = "Select a delivery method.";

    setErrors(next);
    setSubmitError("");
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      // The server prices the order, so only ids and quantities are sent
      const items = cart.items.map((i: CartItem) => ({
        productId: i.id,
        quantity: i.quantity,
        variant: i.variant,
      }));

      // Signed-in customers get their cart saved to the account before
      // checkout (so it's there if they switch devices, and for abandoned-
      // cart recovery); best-effort, never blocks checkout.
      if (isAuthenticated) {
        syncCart({
          items
        }).catch((e) =>  {
          router
        });
      }

      // Re-check stock and current prices right before checkout — the
      // person may have had this cart open a while.
      const validation = await validateCart({ items }).unwrap();
      if (!validation.data.valid) {
        setSubmitError(
          validation.data.issues.map((issue) => issue.message).join(" ") ||
            "Some items in your cart changed. Please review your cart and try again.",
        );
        setSubmitting(false);
        return;
      }

      const response = await placeOrder({
        items,
        addressId,
        phone: cart.phone.trim(),
        deliveryMethod: cart.deliveryMethod,
        promoCode: cart.promo?.code,
      }).unwrap().then(e => {
        router.push(e.data.payment.authorizationUrl)
        cart.clear();
        onPlaced(e.data.orderNumber);
      });

    } catch (err) {
      setSubmitError(
        getErrorMessage(err, "We couldn't place your order. Please try again."),
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <DialogHeader title={`Your Cart (${cart.count})`} />

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {/* Items */}
        <ul className="pt-2">
          {cart.items.map((item: CartItem) => (
            <CartRow key={item.key} item={item} />
          ))}
        </ul>

        <div className="mt-4 space-y-8 border-t border-neutral-200 pt-8">
          {/* Delivery address */}
          <AddressSection
            selectedId={addressId}
            error={errors.address}
            onSelect={(id) => {
              setAddressId(id);
              setErrors((e) => ({ ...e, address: undefined }));
            }}
          />

          {/* Phone */}
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
                setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              placeholder="Enter receiver's phone number"
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? "cart-phone-error" : undefined}
              className={`${fieldClass} mt-3`}
            />
            {errors.phone && (
              <p id="cart-phone-error" role="alert" className="mt-2 text-xs text-red-600">
                {errors.phone}
              </p>
            )}
          </div>

          <hr className="border-neutral-200" />

          {/* Promo code */}
          <PromoSection percentOff={percentOff} />

          {/* Delivery method */}
          <div>
            <label htmlFor="cart-method" className={labelClass}>
              Select Delivery Method
            </label>
            <div className="relative mt-3">
              <select
                id="cart-method"
                value={cart.deliveryMethod}
                onChange={(e) => {
                  cart.setDeliveryMethod(e.target.value);
                  setErrors((prev) => ({ ...prev, method: undefined }));
                }}
                aria-invalid={errors.method ? true : undefined}
                aria-describedby={errors.method ? "cart-method-error" : undefined}
                className={`${fieldClass} appearance-none pr-11 ${cart.deliveryMethod ? "text-neutral-900" : "text-neutral-400"
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
              <p id="cart-method-error" role="alert" className="mt-2 text-xs text-red-600">
                {errors.method}
              </p>
            )}
          </div>

          {/* Totals */}
          <dl className="space-y-3 pt-2 text-xs text-neutral-600">
            <TotalRow label="Items Total" value={formatNaira(cart.itemsTotal)} />
            <TotalRow label="Discount" value={formatNaira(discount)} />
            <TotalRow label="Delivery Fee" value={formatNaira(deliveryFee)} />
            <div className="flex items-center justify-between pt-3 text-sm">
              <dt className="text-neutral-700">Total</dt>
              <dd className="font-bold text-neutral-900">{formatNaira(total)}</dd>
            </div>
          </dl>

          {/* Actions */}
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
              {submitting ? "Placing order..." : "Checkout"}
            </button>
            <button type="button" onClick={closeDialog} className={outlineButton}>
              Back to Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
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
  const isAuthenticated = useAppSelector((s) => s.session.status === "authenticated");
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

function PromoSection({ percentOff }: { percentOff: number }) {
  const cart = useCart();
  const [validatePromo, { isLoading }] = useValidatePromoMutation();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  async function apply() {
    const code = input.trim().toUpperCase();
    if (!code || isLoading) return;

    try {
      const response = await validatePromo({
        code,
        itemsTotal: cart.itemsTotal,
      }).unwrap();

      cart.setPromo(response.data);
      setInput("");
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "That promo code isn't valid."));
    }
  }

  return (
    <div>
      <label htmlFor="cart-promo" className={labelClass}>
        Add Promo Code (Optional)
      </label>

      {cart.promo ? (
        <div className="mt-3 flex h-[52px] items-center justify-between rounded-lg border border-corisio-blue/40 bg-[#e6f3e4] px-4">
          <p className="text-sm text-corisio-blue">
            <span className="font-semibold">{cart.promo.code}</span> applied
            {percentOff > 0 ? ` · ${percentOff}% off` : ""}
          </p>
          <button
            type="button"
            onClick={() => cart.setPromo(null)}
            className="text-xs font-medium text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
          >
            Remove
          </button>
        </div>
      ) : (
        <>
          <div className="relative mt-3">
            <input
              id="cart-promo"
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
              aria-describedby={error ? "cart-promo-error" : undefined}
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
            <p id="cart-promo-error" role="alert" className="mt-2 text-xs text-red-600">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}