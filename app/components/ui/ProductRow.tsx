"use client";

import Image from "next/image";
import Link from "next/link";
import { formatNaira, getDisplayPrice, toCartAddDetail } from "../../utils/product";
import { useIsInCart } from "@/redux/hooks";
import type { StorefrontProduct } from "@/redux/types";

export default function ProductRow({ product }: { product: StorefrontProduct }) {
    // Reflects the real cart, so it stays "Added" until the item is removed.
    const added = useIsInCart(product.id);
    const { price, wasPrice } = getDisplayPrice(product);
    const outOfStock = product.stock <= 0;

    function handleAdd() {
        // Same event as ProductCard, so one cart listener handles both views.
        window.dispatchEvent(new CustomEvent("cart:add", { detail: toCartAddDetail(product) }));
    }

    const href = `/product/${product.slug}`;

    return (
        <article className="flex flex-wrap items-center gap-x-5 gap-y-4 border-b border-neutral-200 py-6 sm:flex-nowrap sm:gap-x-8">
            {/* Image link is hidden from keyboard/AT; the product name is the real link */}
            <Link
                href={href}
                tabIndex={-1}
                aria-hidden="true"
                className="relative block size-24 shrink-0 sm:size-[140px]"
            >
                <Image
                    src={product.images[0]}
                    alt=""
                    fill
                    sizes="140px"
                    className="object-contain"
                />
            </Link>

            <div className="min-w-0 flex-1">
                <h3 className="text-base font-medium text-neutral-700 sm:text-lg">
                    <Link
                        href={href}
                        className="hover:text-corisio-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
                    >
                        {product.name}
                    </Link>
                </h3>

                <p className="mt-0.5 truncate text-xs text-neutral-500">{product.unitType}</p>

                <p className="mt-2 flex flex-wrap items-baseline gap-x-3">
                    <span className="text-2xl font-bold text-neutral-800 sm:text-[28px]">
                        {formatNaira(price)}
                    </span>
                    {wasPrice ? (
                        <del className="text-sm text-neutral-400">{formatNaira(wasPrice)}</del>
                    ) : null}
                </p>
            </div>

            <div className="flex w-full gap-2 sm:w-[150px] sm:flex-col">
                {outOfStock ? (
                    <div className="inline-flex h-11! min-h-11 flex-1 items-center justify-center rounded-lg bg-neutral-100 px-4 text-sm font-medium text-neutral-500">
                        Out of stock
                    </div>
                ) : (
                    <div
                        onClick={handleAdd}
                        className="inline-flex h-11! min-h-11 flex-1 items-center justify-center rounded-lg bg-corisio-blue px-4 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
                    >
                        {added ? (
                            "Added"
                        ) : (
                            <>
                                Add to Cart<span className="sr-only"> {product.name}</span>
                            </>
                        )}
                    </div>
                )}

                <Link
                    href={href}
                    className="inline-flex h-11 min-h-11 flex-1 items-center justify-center rounded-lg border border-corisio-blue px-4 text-sm font-medium text-corisio-blue transition hover:bg-corisio-blue hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
                >
                    View Details<span className="sr-only"> for {product.name}</span>
                </Link>
            </div>
        </article>
    );
}