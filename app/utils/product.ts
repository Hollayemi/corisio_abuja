import type { StorefrontProduct } from "@/redux/types";

export type Product = {
  id: string;
  slug: string;
  name: string;
  qty: number;
  unitPrice: number;
  /** Original price, shown struck through when the product is discounted. */
  oldPrice?: number;
  /** Shown in the green badge on the product image, e.g. 15 -> "15% OFF". */
  discountPercent?: number;
  /** Path under /public, e.g. /products/okro-500g.webp */
  images: string[];
};

/**
 * The price a customer actually pays, and the struck-through price to show
 * next to it (only set when there's a real promotion in effect). The one
 * place that reads promoPrice/originalPrice so every card, row and the
 * detail page agree on what "the price" means.
 */
export function getDisplayPrice(product: StorefrontProduct) {
  const hasPromo =
    typeof product.promoPrice === "number" && product.promoPrice < product.unitPrice;
  return {
    price: hasPromo ? (product.promoPrice as number) : product.unitPrice,
    wasPrice: hasPromo ? product.unitPrice : undefined,
    discountPercent: hasPromo ? (product.discountPercent ?? undefined) : undefined,
  };
}

/**
 * Builds the payload for the "cart:add" event from a storefront product.
 * The cart listener (CartEvents in app/components/providers/AppProviders.tsx)
 * expects CartItem field names (price, image) — this is the one place that
 * maps between them, so every "Add to Cart" button stays consistent and the
 * price actually charged (promo price, if any) is what lands in the cart.
 */
export function toCartAddDetail(
  product: StorefrontProduct,
  opts?: { quantity?: number; variant?: string; price?: number },
) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: opts?.price ?? getDisplayPrice(product).price,
    image: product.images[0],
    quantity: opts?.quantity,
    variant: opts?.variant,
  };
}

/** 1840 -> "₦1,840", 1462.5 -> "₦1,462.50" */
export function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}