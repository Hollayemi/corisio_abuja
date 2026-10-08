"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDownIcon } from "../../../components/ui/icons";
import ProductCard from "../../../components/ui/ProductCard";
import {
  useGetCategoriesQuery,
  useListStorefrontProductsQuery,
} from "@/redux/slices/catalogApi";
import { SORTS } from "../shop/ShopClient";

const PAGE_SIZE = 24;


type SortValue = (typeof SORTS)[number]["value"];

type State = { category: string; sort: SortValue; page: number };

function buildHref(state: State, patch: Partial<State> = {}) {
  const next = { ...state, ...patch };
  const params = new URLSearchParams();
  if (next.category !== "all") params.set("category", next.category);
  if (next.sort !== "nearest") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `/offers?${qs}` : "/offers";
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

export default function OffersClient() {
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "all";
  const sort: SortValue =
    SORTS.find((s) => s.value === searchParams.get("sort"))?.value ?? "nearest";
  const requestedPage = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data, isLoading, isFetching, isError } = useListStorefrontProductsQuery({
    onSale: true,
    category: category === "all" ? undefined : category,
    sort,
    page: requestedPage,
    perPage: PAGE_SIZE,
  });

  const items = data?.data.items ?? [];
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const state: State = { category, sort, page };
  const categories = categoriesData?.data ?? [];
  const sortLabel = SORTS.find((s) => s.value === sort)?.label ?? "Biggest discount";
  const loading = isLoading || isFetching;

  const pill = (active: boolean) =>
    `inline-flex h-9 items-center whitespace-nowrap rounded-full border px-4 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue ${
      active
        ? "border-corisio-blue bg-corisio-blue text-white"
        : "border-neutral-200 bg-white text-neutral-700 hover:border-corisio-blue hover:text-corisio-blue"
    }`;

  return (
    <div>
      {/* Banner */}
      <section className="bg-corisio-blue py-10 text-center text-white sm:py-16">
        <div className={container}>
          <p className="text-sm font-semibold uppercase tracking-wide text-corisio-yellow">
            🔥 Limited-time savings
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Offers</h1>
          <p className="mx-auto mt-3 max-w-[460px] text-sm text-white/80">
            Products on promotion at stores near you. Offers change often, so grab them while they last.
          </p>
          <nav aria-label="Breadcrumb" className="mt-4 text-sm">
            <ol className="flex items-center justify-center gap-2 text-white/80">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-corisio-yellow">
                Offers
              </li>
            </ol>
          </nav>
        </div>
      </section>

      <div className={`${container} py-6 sm:py-12`}>
        {/* Category filter */}
        <nav aria-label="Offer categories" className="-mx-2 overflow-x-auto px-2 pb-1">
          <ul className="flex gap-2">
            <li>
              <Link
                href={buildHref(state, { category: "all", page: 1 })}
                aria-current={category === "all" ? "true" : undefined}
                className={pill(category === "all")}
              >
                All offers
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={buildHref(state, { category: c.slug, page: 1 })}
                  aria-current={category === c.slug ? "true" : undefined}
                  className={pill(category === c.slug)}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Toolbar */}
        <div className="mt-6 flex items-center justify-between border-y border-neutral-200 py-4">
          <p className="text-sm text-neutral-600" aria-live="polite">
            {loading ? "Loading offers…" : `${total} ${total === 1 ? "offer" : "offers"}`}
          </p>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-neutral-900">Sort By</span>
            <details key={sort} className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-corisio-blue [&::-webkit-details-marker]:hidden">
                {sortLabel}
                <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <ul className="absolute right-0 top-full z-20 mt-3 w-52 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                {SORTS.map((s) => (
                  <li key={s.value}>
                    <Link
                      href={buildHref(state, { sort: s.value, page: 1 })}
                      aria-current={s.value === sort ? "true" : undefined}
                      className={`block px-4 py-2 text-sm hover:bg-neutral-50 ${
                        s.value === sort ? "font-medium text-corisio-blue" : "text-neutral-700"
                      }`}
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </div>

        {/* Products */}
        {loading ? (
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
            <p className="text-lg font-semibold text-neutral-900">Couldn&rsquo;t load offers</p>
            <p className="mt-2 text-sm text-neutral-500">Something went wrong. Please try again.</p>
          </div>
        ) : items.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-5">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg font-semibold text-neutral-900">No offers right now</p>
            <p className="mt-2 text-sm text-neutral-500">
              {category === "all"
                ? "Check back soon, stores add new promotions all the time."
                : "There are no offers in this category at the moment."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {category !== "all" && (
                <Link
                  href="/offers"
                  className="inline-flex h-11 items-center rounded-lg bg-corisio-blue px-6 text-sm font-medium text-white transition hover:brightness-110"
                >
                  See all offers
                </Link>
              )}
              <Link
                href="/shop"
                className="inline-flex h-11 items-center rounded-lg border border-neutral-300 px-6 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
              >
                Browse the shop
              </Link>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && !isError && items.length > 0 && totalPages > 1 && (
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
              <span aria-disabled="true" className="inline-flex items-center gap-2 text-neutral-400">
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
              <span aria-disabled="true" className="inline-flex items-center gap-2 font-medium text-neutral-400">
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
