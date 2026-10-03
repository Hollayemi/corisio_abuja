

/**
 * Placeholder catalog shared by the search and product pages.
 * Replace CATALOG and the three async helpers at the bottom with your API or
 * database calls. The pages only depend on those function signatures.
 */

import { Product } from "../utils/product";

export type CatalogItem = Product & {
  category: string;
  /** Placeholder value derived from the category. Replace with a real field. */
  productType: string;
  inStock: boolean;
  delivery: boolean;
  pickup: boolean;
  /** Product page extras (all optional) */
  description?: string;
  about?: string;
  ingredients?: string[];
  variants?: string[];
  gallery?: string[];
};

export const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
] as const;

export type SortValue = (typeof SORTS)[number]["value"];

const TYPE_BY_CATEGORY: Record<string, string> = {
  "meat-protein": "fresh",
  "fish-seafood": "fresh",
  "vegetables-produce": "fresh",
  bakery: "fresh",
  "grains-staples": "packaged",
  groceries: "packaged",
  drinks: "packaged",
  essentials: "packs",
};

const SHOP_MORE_CATEGORY: Record<string, string> = {
  "meat-pie": "bakery",
  "shushu-parfait-and-mousse": "groceries",
  "viju-v-smartic-wheat-1l": "drinks",
  "backwood-s-russian-cream": "groceries",
  "sweet-bite": "bakery",
  "special-doughnut": "bakery",
  "frosty-bite-ice-cream-fantasy": "groceries",
  "heineken-can-beer-33cl": "drinks",
  "fayrouz-pineapple-can": "drinks",
  "peak-powder-tin-2500g": "groceries",
  "mec-chills-parfait-400ml": "groceries",
  "fanta-orange-can-drink": "drinks",
};

function make(
  product: Product,
  category: string,
  extra: Partial<CatalogItem> = {},
): CatalogItem {
  return {
    ...product,
    category,
    productType: TYPE_BY_CATEGORY[category] ?? "packaged",
    inStock: true,
    delivery: true,
    pickup: true,
    ...extra,
  };
}

/** Image path is /products/<slug>.webp */
function item(
  slug: string,
  name: string,
  price: number,
  category: string,
  extra: Partial<CatalogItem> = {},
): CatalogItem {
  return make(
    { id: slug, slug, name, qty: 20, unitPrice:price, images: [`/products/${slug}.webp`] },
    category,
    extra,
  );
}

const fromShopMore = (p: Product) =>
  make(p, SHOP_MORE_CATEGORY[p.slug] ?? "groceries");

export const CATALOG: CatalogItem[] = [

  // The product used in the product page design
  item("fresh-fruit-parfait", "Fresh Fruit Parfait", 4820, "bakery", {
    description:
      "Layers of creamy yoghurt, fresh fruits and crunchy granola, prepared fresh and ready to enjoy.",
    about:
      "A fresh and satisfying parfait made with creamy yoghurt, seasonal fruits and crunchy granola. Perfect for breakfast, a quick snack or a light treat.",
    ingredients: ["Creamy yoghurt", "Fresh fruits", "Granola", "Dates"],
    variants: ["Small", "Medium", "Large"],
    gallery: [
      "/products/fresh-fruit-parfait.webp",
      "/products/fresh-fruit-parfait-pack.webp",
    ],
  }),
];

/* ------------------------------------------------------------------ */
/* Query helpers                                                       */
/* ------------------------------------------------------------------ */

export type ProductQuery = {
  q?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  types?: string[];
  /** "in-stock" | "delivery" | "pickup" */
  availability?: string[];
  /** lowercase variant names, e.g. "small" */
  sizes?: string[];
  sort?: SortValue;
  page?: number;
  pageSize?: number;
};

export async function queryProducts(query: ProductQuery = {}) {
  const {
    q = "",
    categories = [],
    minPrice,
    maxPrice,
    types = [],
    availability = [],
    sizes = [],
    sort = "featured",
    page = 1,
    pageSize = 20,
  } = query;

  const needle = q.trim().toLowerCase();

  const list = CATALOG.filter((p) => {
    if (needle && !p.name.toLowerCase().includes(needle)) return false;
    if (categories.length && !categories.includes(p.category)) return false;
    if (minPrice !== undefined && p.unitPrice < minPrice) return false;
    if (maxPrice !== undefined && p.unitPrice > maxPrice) return false;
    if (types.length && !types.includes(p.productType)) return false;
    if (availability.includes("in-stock") && !p.inStock) return false;
    if (availability.includes("delivery") && !p.delivery) return false;
    if (availability.includes("pickup") && !p.pickup) return false;
    if (
      sizes.length &&
      !sizes.some((s) => p.variants?.some((v) => v.toLowerCase() === s))
    ) {
      return false;
    }
    return true;
  });

  if (sort === "price-asc") list.sort((a, b) => a.unitPrice - b.unitPrice);
  if (sort === "price-desc") list.sort((a, b) => b.unitPrice - a.unitPrice);
  if (sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);

  return {
    items: list.slice((current - 1) * pageSize, current * pageSize),
    total,
    totalPages,
    page: current,
  };
}

export async function getProductBySlug(slug: string) {
  return CATALOG.find((p) => p.slug === slug);
}

/** Same category first, then anything else, never the product itself. */
export async function getRelatedProducts(slug: string, limit = 5) {
  const current = CATALOG.find((p) => p.slug === slug);
  const others = CATALOG.filter((p) => p.slug !== slug);
  const sameCategory = others.filter((p) => p.category === current?.category);
  const rest = others.filter((p) => !sameCategory.includes(p));
  return [...sameCategory, ...rest].slice(0, limit);
}
