"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDownIcon } from "../../../components/ui/icons";
import ProductCard from "../../../components/ui/ProductCard";
import ProductRow from "../../../components/ui/ProductRow";
import { Categories } from "../../../components/Sections";
import {
  useGetCategoriesQuery,
  useListStorefrontProductsQuery,
} from "@/redux/slices/catalogApi";

const PAGE_SIZE = 24;

export const SORTS = [
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "best-selling", label: "Best sellers" },
  { value: "newest", label: "Newest" },
  { value: "trending", label: "Trending" },
  { value: "nearest", label: "Nearest stores" },
] as const;

type SortValue = (typeof SORTS)[number]["value"];

type ViewMode = "grid" | "list";

type State = {
  category: string;
  q: string;
  sort: SortValue;
  view: ViewMode;
  page: number;
};

function buildHref(state: State, patch: Partial<State> = {}) {
  const next = { ...state, ...patch };
  const params = new URLSearchParams();

  if (next.category !== "all") params.set("category", next.category);
  if (next.q) params.set("q", next.q);
  if (next.sort !== "nearest") params.set("sort", next.sort);
  if (next.view !== "grid") params.set("view", next.view);
  if (next.page > 1) params.set("page", String(next.page));

  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

function pageItems(current: number, total: number): (number | "…")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const items: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("…");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push("…");
  items.push(total);

  return items;
}

const container = "mx-auto w-full max-w-[1240px] px-2 sm:px-6";

export default function ShopClient() {
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "all";
  const q = (searchParams.get("q") ?? "").trim().slice(0, 80);
  const sort: SortValue =
    SORTS.find((s) => s.value === searchParams.get("sort"))?.value ?? "nearest";
  const view: ViewMode = searchParams.get("view") === "list" ? "list" : "grid";
  const requestedPage = Math.max(
    1,
    Number.parseInt(searchParams.get("page") ?? "1", 10) || 1,
  );

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data, isLoading, isFetching, isError } = useListStorefrontProductsQuery({
    category: category === "all" ? undefined : category,
    search: q || undefined,
    sort,
    page: requestedPage,
    perPage: PAGE_SIZE,
  });

  const items = data?.data.items ?? [];
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const state: State = { category, q, sort, view, page };
  const categoryLabel = categoriesData?.data.find((c) => c.slug === category)?.name;
  const sortLabel = SORTS.find((s) => s.value === sort)?.label ?? "Featured";

  return (
    <div>
      {/* Page banner */}
      <section className="bg-[#f2f2f0] py-5 md:py-12 text-center sm:py-16">
        <div className={container}>
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            Shop
          </h1>

          <nav aria-label="Breadcrumb" className="mt-3 text-sm">
            <ol className="flex items-center justify-center gap-2 text-neutral-900">
              <li>
                <Link href="/" className="hover:text-corisio-blue">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                {categoryLabel ? (
                  <Link href="/shop" className="hover:text-corisio-blue">
                    Shop
                  </Link>
                ) : (
                  <span aria-current="page" className="text-corisio-blue">
                    Shop
                  </span>
                )}
              </li>
              {categoryLabel && (
                <>
                  <li aria-hidden="true">/</li>
                  <li aria-current="page" className="text-corisio-blue">
                    {categoryLabel}
                  </li>
                </>
              )}
            </ol>
          </nav>
        </div>
      </section>

      <div className={`${container} py-3 sm:py-16`}>
        {/* Category filter */}
        <Categories fromShop category={category} />

        {/* Toolbar: sort + view */}
        <div className="mt-12 flex items-center justify-between border-y border-neutral-200 py-4 sm:mt-16">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-neutral-900">Sort By</span>

            <details key={sort} className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-corisio-blue [&::-webkit-details-marker]:hidden">
                {sortLabel}
                <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
              </summary>

              <ul className="absolute left-0 top-full z-20 mt-3 w-52 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                {SORTS.map((s) => (
                  <li key={s.value}>
                    <Link
                      href={buildHref(state, { sort: s.value, page: 1 })}
                      aria-current={s.value === sort ? "true" : undefined}
                      className={`block px-4 py-2 text-sm hover:bg-neutral-50 ${s.value === sort
                        ? "font-medium text-corisio-blue"
                        : "text-neutral-700"
                        }`}
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-neutral-900">View as</span>

            <Link
              href={buildHref(state, { view: "list" })}
              aria-label="Larger cards"
              aria-current={view === "list" ? "true" : undefined}
              className={`rounded p-1 transition-colors ${view === "list"
                ? "text-neutral-900"
                : "text-neutral-400 hover:text-neutral-700"
                }`}
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </Link>

            <Link
              href={buildHref(state, { view: "grid" })}
              aria-label="Compact grid"
              aria-current={view === "grid" ? "true" : undefined}
              className={`rounded p-1 transition-colors ${view === "grid"
                ? "text-neutral-900"
                : "text-neutral-400 hover:text-neutral-700"
                }`}
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
                <rect x="4" y="4" width="6" height="6" rx="1.5" />
                <rect x="14" y="4" width="6" height="6" rx="1.5" />
                <rect x="4" y="14" width="6" height="6" rx="1.5" />
                <rect x="14" y="14" width="6" height="6" rx="1.5" />
              </svg>
            </Link>
          </div>
        </div>

        {q && (
          <p className="mt-6 text-sm text-neutral-600" aria-live="polite">
            {total} {total === 1 ? "result" : "results"} for &ldquo;{q}&rdquo;
          </p>
        )}

        {/* Products */}
        {isLoading || isFetching ? (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-5">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[11/10] rounded-xl bg-neutral-200" />
                <div className="mt-2.5 h-4 w-3/4 rounded bg-neutral-200" />
                <div className="mt-2 h-4 w-1/2 rounded bg-neutral-200" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-20 text-center">
            <p className="text-lg font-semibold text-neutral-900">
              Couldn&rsquo;t load products
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Something went wrong. Please try again.
            </p>
          </div>
        ) : items.length > 0 ? (
          view === "grid" ? (
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-5">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-2">
              {items.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </div>
          )
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg font-semibold text-neutral-900">
              No products found
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Try a different category or search term.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex h-11 items-center rounded-lg bg-corisio-blue px-6 text-sm font-medium text-white transition hover:brightness-110"
            >
              Clear filters
            </Link>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isFetching && !isError && items.length > 0 && (
          <nav
            aria-label="Pagination"
            className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm sm:gap-x-10"
          >
            {page > 1 ? (
              <Link
                href={buildHref(state, { page: page - 1 })}
                rel="prev"
                className="inline-flex items-center gap-2 text-neutral-900 hover:text-corisio-blue"
              >
                <ChevronDownIcon className="size-4 rotate-90" />
                Previous
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex items-center gap-2 text-neutral-400"
              >
                <ChevronDownIcon className="size-4 rotate-90" />
                Previous
              </span>
            )}

            <ul className="flex items-center gap-4">
              {pageItems(page, totalPages).map((entry, i) =>
                entry === "…" ? (
                  <li key={`gap-${i}`} aria-hidden="true" className="text-neutral-500">
                    …
                  </li>
                ) : (
                  <li key={entry}>
                    <Link
                      href={buildHref(state, { page: entry })}
                      aria-label={`Page ${entry}`}
                      aria-current={entry === page ? "page" : undefined}
                      className={
                        entry === page
                          ? "font-medium text-corisio-yellow underline underline-offset-8"
                          : "text-neutral-900 hover:text-corisio-blue"
                      }
                    >
                      {entry}
                    </Link>
                  </li>
                ),
              )}
            </ul>

            {page < totalPages ? (
              <Link
                href={buildHref(state, { page: page + 1 })}
                rel="next"
                className="inline-flex items-center gap-2 font-medium text-neutral-900 hover:text-corisio-blue"
              >
                Next
                <ChevronDownIcon className="size-4 -rotate-90" />
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex items-center gap-2 font-medium text-neutral-400"
              >
                Next
                <ChevronDownIcon className="size-4 -rotate-90" />
              </span>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
