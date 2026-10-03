"use client";

import Image from "next/image";
import Link from "next/link";
import { formatNaira, getDisplayPrice, toCartAddDetail } from "../../utils/product";
import { useIsInCart } from "@/redux/hooks";
import type { StorefrontProduct } from "@/redux/types";

export default function ProductCard({ product }: { product: StorefrontProduct }) {
  // The real source of truth for the button label: stays "Added" for as
  // long as the item is actually in the cart, and reverts if it's removed.
  const added = useIsInCart(product.id);
  const { price, wasPrice, discountPercent } = getDisplayPrice(product);
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    // Works for guests too — no login or server round-trip needed just to
    // add to the cart. CartEvents (AppProviders.tsx) puts it in the local
    // cart; the account's saved cart is synced separately, only when
    // signed in (see ServerCartSync/CartAutoSync in redux/provider.tsx).
    window.dispatchEvent(new CustomEvent("cart:add", { detail: toCartAddDetail(product) }));
  }

  const href = `/product/${product.slug}`;

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[11/10] overflow-hidden rounded-xl  border-neutral-200 bg-white">
        {/* Image link is hidden from keyboard/AT; the product name below is the real link */}
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-0"
        >
          <Image
            src={product.images[0]}
            alt=""
            fill
            sizes="(min-width: 1024px) 190px, (min-width: 640px) 30vw, 46vw"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {discountPercent ? (
          <span className="pointer-events-none absolute left-2 top-2 flex size-9 flex-col items-center justify-center rounded-full bg-corisio-blue text-[9px] font-bold leading-none text-white">
            <span>{discountPercent}%</span>
            <span>OFF</span>
          </span>
        ) : null}

        {outOfStock ? (
          <span className="pointer-events-none absolute inset-x-2 bottom-2 rounded-md bg-neutral-900/80 py-1 text-center text-[10px] font-medium text-white">
            Out of stock
          </span>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className="absolute bottom-2 right-0 inline-flex h-7 -translate-x-2 items-center gap-1 whitespace-nowrap rounded-md border border-neutral-300 bg-white px-3 text-[11px] font-medium text-corisio-blue shadow-sm transition hover:border-corisio-blue hover:bg-corisio-blue hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
          >
            {added ? (
              "Added"
            ) : (
              <>
                Add to Cart <span aria-hidden="true">+</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="mt-2.5">
        <h3 className="truncate text-sm font-medium text-neutral-800">
          <Link
            href={href}
            title={product.name}
            className="hover:text-corisio-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-0.5 truncate text-xs text-neutral-500">{product.unitType}</p>

        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
          <span className="text-base font-bold text-neutral-900">
            {formatNaira(price)}
          </span>
          {wasPrice ? (
            <del className="text-xs text-neutral-400">{formatNaira(wasPrice)}</del>
          ) : null}
        </p>
      </div>
    </article>
  );
}
