"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  FacebookIcon,
  LinkedInIcon,
  MailIcon,
  WhatsAppIcon,
} from "./icons";
import { toCartAddDetail } from "@/app/utils/product";
import { useIsInCart } from "@/redux/hooks";
import type { ProductVariant } from "@/redux/types/inventory";
import type { StorefrontProduct } from "@/redux/types";

const MAX_QTY = 99;

type ShareKind = "whatsapp" | "facebook" | "linkedin" | "mail" | "copy";

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

const SHARE_BUTTONS: { kind: ShareKind; label: string; icon: ReactNode }[] = [
  { kind: "whatsapp", label: "Share on WhatsApp", icon: <WhatsAppIcon className="size-5" /> },
  { kind: "facebook", label: "Share on Facebook", icon: <FacebookIcon className="size-5" /> },
  { kind: "linkedin", label: "Share on LinkedIn", icon: <LinkedInIcon className="size-5" /> },
  { kind: "mail", label: "Share by email", icon: <MailIcon className="size-5" /> },
  { kind: "copy", label: "Copy link", icon: <LinkIcon className="size-5" /> },
];

export default function ProductPurchase({
  product,
  variants,
}: {
  product: StorefrontProduct;
  variants?: ProductVariant[];
}) {
  const [variant, setVariant] = useState<ProductVariant | undefined>(variants?.[0]);
  const [quantity, setQuantity] = useState(1);
  // Reflects the real cart for this exact variant, so it stays "Added to
  // Cart" until the item is actually removed, and switches back if the
  // person picks a different variant that isn't in the cart yet.
  const added = useIsInCart(product.id, variant?.label);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");

  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  // A variant (when there is one) has its own stock and price; otherwise
  // fall back to the base product.
  const stock = variant ? variant.stock : product.stock;
  const outOfStock = stock <= 0;
  const maxQty = Math.max(1, Math.min(MAX_QTY, stock || MAX_QTY));

  function selectVariant(v: ProductVariant) {
    setVariant(v);
    // Quantity resets with the variant since a different variant can have
    // much less stock than what was picked before.
    setQuantity(1);
  }

  function flash(message: string) {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 2500);
  }

  function handleAdd() {
    if (outOfStock) return;
    // Works for guests too — CartEvents (AppProviders.tsx) puts this
    // straight into the local cart; no login required.
    window.dispatchEvent(
      new CustomEvent("cart:add", {
        detail: toCartAddDetail(product, {
          quantity,
          variant: variant?.label,
          price: variant?.unitPrice,
        }),
      }),
    );
  }

  function handleSave() {
    const next = !saved;
    setSaved(next);
    // Your wishlist can listen for this: window.addEventListener("wishlist:toggle", ...)
    window.dispatchEvent(
      new CustomEvent("wishlist:toggle", { detail: { product, saved: next } }),
    );
    flash(next ? "Saved for later" : "Removed from saved items");
  }

  async function handleShare(kind: ShareKind) {
    const url = window.location.href;

    if (kind === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        flash("Link copied");
      } catch {
        flash("Couldn't copy the link");
      }
      return;
    }

    if (kind === "mail") {
      window.location.href = `mailto:?subject=${encodeURIComponent(
        product.name,
      )}&body=${encodeURIComponent(url)}`;
      return;
    }

    const targets = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${product.name} ${url}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };
    window.open(targets[kind], "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-8">
      {variants && variants.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-neutral-800">Variants</h2>
          <div
            role="radiogroup"
            aria-label="Variants"
            className="mt-4 flex flex-wrap gap-3"
          >
            {variants.map((v) => {
              const selected = v.id === variant?.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={v.stock <= 0}
                  onClick={() => selectVariant(v)}
                  className={`h-12 rounded-full border px-6 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue disabled:cursor-not-allowed disabled:opacity-40 ${
                    selected
                      ? "border-corisio-blue bg-corisio-blue font-medium text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-corisio-blue"
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-base font-semibold text-neutral-800">Quantity</h2>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="inline-flex h-14 items-center gap-2 rounded-full border border-neutral-200 px-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || outOfStock}
              aria-label="Decrease quantity"
              className="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-lg leading-none text-neutral-800 transition hover:bg-neutral-200 disabled:opacity-40"
            >
              −
            </button>
            <output
              aria-live="polite"
              aria-label="Quantity"
              className="w-10 text-center text-sm text-neutral-900"
            >
              {quantity}
            </output>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              disabled={quantity >= maxQty || outOfStock}
              aria-label="Increase quantity"
              className="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-lg leading-none text-neutral-800 transition hover:bg-neutral-200 disabled:opacity-40"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            className="h-14 rounded-lg bg-corisio-blue px-9 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {outOfStock ? "Out of Stock" : added ? "Added to Cart" : "Add to Cart"}
          </button>

          <button
            type="button"
            onClick={handleSave}
            aria-pressed={saved}
            className="h-14 rounded-lg bg-corisio-yellow px-9 text-sm font-medium text-black transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-yellow"
          >
            {saved ? "Saved" : "Save For Later"}
          </button>
        </div>

        {!outOfStock && product.reorderLevel > 0 && stock <= product.reorderLevel && (
          <p className="mt-3 text-sm text-amber-600">Only {stock} left in stock</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-neutral-200 pt-8">
        <span className="text-base font-semibold text-neutral-900">Share:</span>
        <ul className="flex items-center gap-3 text-neutral-700">
          {SHARE_BUTTONS.map((s) => (
            <li key={s.kind}>
              <button
                type="button"
                onClick={() => handleShare(s.kind)}
                aria-label={s.label}
                className="rounded p-1 transition hover:text-corisio-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
              >
                {s.icon}
              </button>
            </li>
          ))}
        </ul>
        <p role="status" className="min-h-5 text-sm text-corisio-blue">
          {notice}
        </p>
      </div>
    </div>
  );
}
