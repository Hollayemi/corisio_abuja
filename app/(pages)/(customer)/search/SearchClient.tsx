"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import {
  ChevronDownIcon,
  CloseIcon,
  SearchIcon,
} from "@/app/components/ui/icons";
import Pagination from "@/app/components/ui/Pagination";
import ProductCard from "@/app/components/ui/ProductCard";
import ProductRow from "@/app/components/ui/ProductRow";
import {
  useGetCategoriesQuery,
  useListStorefrontProductsQuery,
} from "@/redux/slices/catalogApi";
import { SORTS } from "../shop/ShopClient";

const PAGE_SIZE = 20;
const container = "mx-auto w-full max-w-[1240px] px-4 sm:px-6";

/* ------------------------------------------------------------------ */
/* Options                                                             */
/* ------------------------------------------------------------------ */

type Option = { value: string; label: string };


type SortValue = (typeof SORTS)[number]["value"];

const TYPE_OPTIONS: Option[] = [
  { value: "fresh", label: "Fresh" },
  { value: "frozen", label: "Frozen" },
  { value: "processed", label: "Processed" },
  { value: "packaged", label: "Packaged" },
  { value: "packs", label: "Packs" },
  { value: "cartons", label: "Cartons" },
];

const AVAILABILITY_OPTIONS: Option[] = [
  { value: "in-stock", label: "In Stock" },
  { value: "delivery", label: "Available for Delivery" },
  { value: "pickup", label: "Available for Pickup" },
];

const SIZE_OPTIONS: Option[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

/* ------------------------------------------------------------------ */
/* URL state                                                           */
/* ------------------------------------------------------------------ */

type ViewMode = "grid" | "list";

type State = {
  q: string;
  categories: string[];
  min?: number;
  max?: number;
  types: string[];
  availability: string[];
  sizes: string[];
  sort: SortValue;
  view: ViewMode;
  page: number;
};

const onlyKnown = (values: string[], options: Option[]) =>
  values.filter((v) => options.some((o) => o.value === v));

function toPrice(raw: string | null) {
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function buildHref(state: State, patch: Partial<State> = {}) {
  const next = { ...state, ...patch };
  const params = new URLSearchParams();

  if (next.q) params.set("q", next.q);
  next.categories.forEach((v) => params.append("category", v));
  if (next.min !== undefined) params.set("min", String(next.min));
  if (next.max !== undefined) params.set("max", String(next.max));
  next.types.forEach((v) => params.append("type", v));
  next.availability.forEach((v) => params.append("availability", v));
  next.sizes.forEach((v) => params.append("size", v));
  if (next.sort !== "nearest") params.set("sort", next.sort);
  if (next.view !== "grid") params.set("view", next.view);
  if (next.page > 1) params.set("page", String(next.page));

  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function SlidersIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

function FilterGroup({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group border-b border-neutral-200 py-6 first-of-type:pt-0"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-corisio-blue [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden="true" className="text-xl font-normal leading-none">
          <span className="group-open:hidden">+</span>
          <span className="hidden group-open:inline">–</span>
        </span>
      </summary>
      <div className="mt-5">{children}</div>
    </details>
  );
}

function CheckList({
  name,
  options,
  selected,
}: {
  name: string;
  options: Option[];
  selected: string[];
}) {
  return (
    <ul className="flex flex-col gap-3.5">
      {options.map((o) => (
        <li key={o.value}>
          <label className="flex cursor-pointer items-center gap-3 text-sm text-neutral-800">
            <input
              type="checkbox"
              name={name}
              value={o.value}
              defaultChecked={selected.includes(o.value)}
              className="size-5 shrink-0 rounded border-neutral-300 accent-corisio-blue"
            />
            {o.label}
          </label>
        </li>
      ))}
    </ul>
  );
}

function PriceInput({
  name,
  label,
  placeholder,
  defaultValue,
}: {
  name: string;
  label: string;
  placeholder: string;
  defaultValue?: number;
}) {
  return (
    <label className="relative block min-w-0 flex-1">
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500"
      >
        ₦
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-8 pr-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-corisio-blue focus:outline-none focus:ring-2 focus:ring-corisio-blue/30"
      />
    </label>
  );
}

function FiltersForm({
  state,
  categoryOptions,
}: {
  state: State;
  categoryOptions: Option[];
}) {
  const clearHref = buildHref(state, {
    categories: [],
    min: undefined,
    max: undefined,
    types: [],
    availability: [],
    sizes: [],
    page: 1,
  });

  return (
    <form action="/search" method="get">
      {state.q && <input type="hidden" name="q" value={state.q} />}
      {state.sort !== "nearest" && (
        <input type="hidden" name="sort" value={state.sort} />
      )}
      {state.view !== "grid" && (
        <input type="hidden" name="view" value={state.view} />
      )}

      <FilterGroup title="Category">
        <CheckList
          name="category"
          options={categoryOptions}
          selected={state.categories}
        />
      </FilterGroup>

      <FilterGroup title="Price">
        <div className="flex items-center gap-3">
          <PriceInput
            name="min"
            label="Minimum price"
            placeholder="0"
            defaultValue={state.min}
          />
          <span aria-hidden="true" className="text-neutral-500">
            –
          </span>
          <PriceInput
            name="max"
            label="Maximum price"
            placeholder="200,000"
            defaultValue={state.max}
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Product Type">
        <CheckList name="type" options={TYPE_OPTIONS} selected={state.types} />
      </FilterGroup>

      <FilterGroup title="Availability">
        <CheckList
          name="availability"
          options={AVAILABILITY_OPTIONS}
          selected={state.availability}
        />
      </FilterGroup>

      <FilterGroup title="Weight / Size" defaultOpen={state.sizes.length > 0}>
        <CheckList name="size" options={SIZE_OPTIONS} selected={state.sizes} />
      </FilterGroup>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          className="h-12 flex-1 rounded-xl bg-corisio-blue text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
        >
          Apply
        </button>
        <Link
          href={clearHref}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border-2 border-neutral-300 text-sm font-medium text-neutral-800 transition hover:border-corisio-blue hover:text-corisio-blue"
        >
          Clear
        </Link>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function SearchClient() {
  const searchParams = useSearchParams();
  const { data: categoriesData } = useGetCategoriesQuery();

  const CATEGORY_OPTIONS: Option[] = (categoriesData?.data ?? []).map((c) => ({
    value: c.slug,
    label: c.name,
  }));

  const q = (searchParams.get("q") ?? "").trim().slice(0, 80);
  const categories = onlyKnown(searchParams.getAll("category"), CATEGORY_OPTIONS);
  const min = toPrice(searchParams.get("min"));
  const max = toPrice(searchParams.get("max"));
  const types = onlyKnown(searchParams.getAll("type"), TYPE_OPTIONS);
  const availability = onlyKnown(searchParams.getAll("availability"), AVAILABILITY_OPTIONS);
  const sizes = onlyKnown(searchParams.getAll("size"), SIZE_OPTIONS);
  const sort: SortValue =
    SORTS.find((s) => s.value === searchParams.get("sort"))?.value ?? "nearest";
  const view: ViewMode = searchParams.get("view") === "list" ? "list" : "grid";
  const requestedPage = Math.max(
    1,
    Number.parseInt(searchParams.get("page") ?? "1", 10) || 1,
  );

  const { data, isLoading, isFetching, isError } = useListStorefrontProductsQuery({
    search: q || undefined,
    category: categories.length ? categories : undefined,
    minPrice: min,
    maxPrice: max,
    types: types.length ? types : undefined,
    availability: availability.length ? availability : undefined,
    sizes: sizes.length ? sizes : undefined,
    sort,
    page: requestedPage,
    perPage: PAGE_SIZE,
  });

  const items = data?.data.items ?? [];
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const state: State = {
    q,
    categories,
    min,
    max,
    types,
    availability,
    sizes,
    sort,
    view,
    page,
  };

  // Remounts the uncontrolled inputs whenever the URL filters change
  const filtersKey = buildHref({ ...state, page: 1 });
  const sortLabel = SORTS.find((s) => s.value === sort)?.label ?? "Relevance";
  const selectValue = categories.length === 1 ? categories[0] : "all";
  const loading = isLoading || isFetching;

  return (
    <div>
      {/* Page banner */}
      <section className="bg-[#f2f2f0] py-12 text-center sm:py-16">
        <div className={container}>
          <p className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            Search
          </p>
          <nav aria-label="Breadcrumb" className="mt-3 text-sm">
            <ol className="flex items-center justify-center gap-2 text-neutral-900">
              <li>
                <Link href="/" className="hover:text-corisio-blue">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-corisio-blue">
                Search
              </li>
            </ol>
          </nav>
        </div>
      </section>

      <div className={`${container} py-12 sm:py-16`}>
        {/* Search bar */}
        <form
          key={`${q}|${selectValue}`}
          action="/search"
          method="get"
          role="search"
          className="mx-auto flex h-[60px] w-full max-w-[690px] items-center rounded-xl border-2 border-corisio-blue bg-white focus-within:ring-2 focus-within:ring-corisio-blue/30"
        >
          <div className="relative flex h-full shrink-0 items-center">
            <select
              name="category"
              aria-label="Category"
              defaultValue={selectValue}
              className="h-full w-[132px] appearance-none truncate bg-transparent pl-4 pr-9 text-sm text-neutral-600 focus:outline-none sm:w-[190px] sm:pl-5 sm:text-base"
            >
              <option value="all">All Categories</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 size-4 text-neutral-700 sm:right-4" />
          </div>

          <span aria-hidden="true" className="h-8 w-px bg-neutral-300" />

          <SearchIcon className="ml-3 size-5 shrink-0 text-neutral-700 sm:ml-4" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search for products..."
            aria-label="Search for products"
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none sm:text-base"
          />

          {q && (
            <Link
              href="/search"
              aria-label="Clear search"
              className="px-4 text-neutral-500 hover:text-neutral-900 sm:px-5"
            >
              <CloseIcon className="size-4" />
            </Link>
          )}

          <button type="submit" className="sr-only">
            Search
          </button>
        </form>

        {/* Toolbar */}
        <div className="mt-10 border-y border-neutral-200 sm:mt-14">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-5">
              <span className="hidden items-center gap-3 text-sm font-medium text-neutral-900 lg:flex">
                Filter
                <SlidersIcon className="size-5" />
              </span>
              <span
                aria-hidden="true"
                className="hidden h-6 w-px bg-neutral-200 lg:block"
              />

              <span className="text-sm font-medium text-neutral-900">
                Sort By
              </span>

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
                        className={`block px-4 py-2 text-sm hover:bg-neutral-50 ${
                          s.value === sort
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
              <span className="text-sm font-medium text-neutral-900">
                View as
              </span>

              <Link
                href={buildHref(state, { view: "list" })}
                aria-label="List view"
                aria-current={view === "list" ? "true" : undefined}
                className={`rounded p-1 transition-colors ${
                  view === "list"
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
                aria-label="Grid view"
                aria-current={view === "grid" ? "true" : undefined}
                className={`rounded p-1 transition-colors ${
                  view === "grid"
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

          {/* Filters on small screens */}
          <details className="border-t border-neutral-200 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-3 py-4 text-sm font-medium text-neutral-900 [&::-webkit-details-marker]:hidden">
              Filter
              <SlidersIcon className="size-5" />
            </summary>
            <div className="pb-6">
              <FiltersForm key={`m-${filtersKey}`} state={state} categoryOptions={CATEGORY_OPTIONS} />
            </div>
          </details>
        </div>

        <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Sidebar (desktop) */}
          <aside className="hidden py-10 pr-10 lg:block lg:border-r lg:border-neutral-200">
            <FiltersForm key={`d-${filtersKey}`} state={state} categoryOptions={CATEGORY_OPTIONS} />
          </aside>

          {/* Results */}
          <div className="pt-8 lg:py-10 lg:pl-10">
            <p className="mb-8 text-sm text-neutral-600" aria-live="polite">
              {total} {total === 1 ? "result" : "results"}
              {q ? <> for &ldquo;{q}&rdquo;</> : null}
            </p>

            {loading ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:gap-x-5 xl:grid-cols-5">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[11/10] rounded-xl bg-neutral-200" />
                    <div className="mt-2.5 h-4 w-3/4 rounded bg-neutral-200" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-neutral-200" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="py-16 text-center">
                <p className="text-lg font-semibold text-neutral-900">
                  Couldn&rsquo;t load results
                </p>
                <p className="mt-2 text-sm text-neutral-500">
                  Something went wrong. Please try again.
                </p>
              </div>
            ) : items.length > 0 ? (
              view === "grid" ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:gap-x-5 xl:grid-cols-5">
                  {items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div>
                  {items.map((product) => (
                    <ProductRow key={product.id} product={product} />
                  ))}
                </div>
              )
            ) : (
              <div className="py-16 text-center">
                <p className="text-lg font-semibold text-neutral-900">
                  No products found
                </p>
                <p className="mt-2 text-sm text-neutral-500">
                  Try a different search term or clear some filters.
                </p>
                <Link
                  href="/search"
                  className="mt-6 inline-flex h-11 items-center rounded-lg bg-corisio-blue px-6 text-sm font-medium text-white transition hover:brightness-110"
                >
                  Reset search
                </Link>
              </div>
            )}
          </div>
        </div>

        {!loading && !isError && items.length > 0 && (
          <Pagination
            className="mt-14"
            page={page}
            totalPages={totalPages}
            hrefForPage={(p) => buildHref(state, { page: p })}
          />
        )}
      </div>
    </div>
  );
}
