"use client";

import Link from "next/link";
import { DAYS } from "@/app/components/admin/settings/store/fields";
import { FALLBACK_STORE_IMAGE, formatKm, formatNaira, isStoreOpen, todayHoursLabel } from "@/app/utils/geo";
import { getErrorMessage } from "@/redux/config/errors";
import { useGetPublicStoreQuery, useListPublicStoresQuery } from "@/redux/slices/publicStoresApi";
import type { PublicStoreDetail } from "@/redux/types";

/* eslint-disable @next/next/no-img-element */

const label = "text-xs font-semibold uppercase tracking-wide text-neutral-400";

export default function StoreClient({ slug }: { slug: string }) {
  const result = useGetPublicStoreQuery(slug);

  if (result.isLoading) {
    return (
      <div aria-busy="true" className="animate-pulse">
        <div className="h-[220px] bg-neutral-200 sm:h-[300px]" />
        <div className="mx-auto mt-10 h-40 max-w-[1100px] rounded-2xl bg-neutral-100" />
      </div>
    );
  }

  if (result.isError || !result.data) {
    const notFound = (result.error as { status?: number } | undefined)?.status === 404;
    return (
      <div className="mx-auto max-w-[600px] px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-neutral-800">{notFound ? "Store not found" : "Couldn't load this store"}</h1>
        <p className="mt-2 text-sm text-neutral-500">{notFound ? "It may have been removed or the link is wrong." : getErrorMessage(result.error)}</p>
        <div className="mt-6 flex justify-center gap-3">
          {!notFound && <button onClick={() => result.refetch()} className="rounded-lg bg-corisio-blue px-5 py-2.5 text-sm font-semibold text-white">Try again</button>}
          <Link href="/stores" className="rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-700">Back to map</Link>
        </div>
      </div>
    );
  }

  return <StoreView store={result.data.data} />;
}

function StoreView({ store }: { store: PublicStoreDetail }) {
  const open = isStoreOpen(store);
  const today = todayHoursLabel(store);
  const primary = store.locations[0];
  const links = Object.entries(store.socialLinks ?? {}).filter(([, v]) => v);

  // Other stores in the same category, nearest first (the request carries the visitor's location)
  const categorySlug = store.categories[0]?.slug;
  const more = useListPublicStoresQuery(categorySlug ? { category: categorySlug, limit: 4 } : undefined, { skip: !categorySlug });
  const moreStores = (more.data?.data.items ?? []).filter((s) => s.slug !== store.slug).slice(0, 3);

  return (
    <div>
      <div className="relative h-[220px] w-full bg-neutral-200 sm:h-[300px]">
        <img src={store.banner || store.logo || FALLBACK_STORE_IMAGE} alt={store.name} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[1100px] px-4 pb-6 text-white sm:px-6">
          <Link href="/stores" className="text-xs font-medium text-white/80 hover:text-white">← Back to map</Link>
          {store.categories[0] && <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-corisio-yellow">{store.categories[0].name}</p>}
          <h1 className="text-2xl font-bold sm:text-4xl">{store.name}</h1>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1100px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px]">
        <div>
          {store.tagline && <p className="text-[15px] font-medium text-neutral-700">{store.tagline}</p>}
          {store.description && <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-neutral-600">{store.description}</p>}

          <h2 className="mt-10 text-xl font-bold text-neutral-800">Products available</h2>
          {store.products.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">No products listed yet.</p>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-3">
              {store.products.map((p) => (
                <li key={p.id}>
                  <Link href={`/product/${p.slug}`} className="block overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:shadow-md">
                    <div className="aspect-square bg-neutral-50">
                      {p.image && <img src={p.image} alt={p.name} className="size-full object-contain p-4" />}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-neutral-700">{p.name}</p>
                      <p className="mt-1 text-sm font-bold text-corisio-blue">{formatNaira(p.price)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-neutral-400">Prices and availability are set by the store. Call ahead to confirm stock.</p>

          {store.locations.length > 1 && (
            <>
              <h2 className="mt-12 text-xl font-bold text-neutral-800">Locations</h2>
              <ul className="mt-4 divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
                {store.locations.map((l) => (
                  <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-800">
                        {l.label}
                        {l.distanceKm != null && <span className="ml-2 text-xs font-semibold text-corisio-blue">{formatKm(l.distanceKm)}</span>}
                      </p>
                      <p className="mt-0.5 text-sm text-neutral-500">{l.address}, {l.region}</p>
                    </div>
                    <a href={`https://www.openstreetmap.org/directions?to=${l.latitude}%2C${l.longitude}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-corisio-blue hover:underline">Directions</a>
                  </li>
                ))}
              </ul>
            </>
          )}

          {moreStores.length > 0 && (
            <>
              <h2 className="mt-12 text-xl font-bold text-neutral-800">More {store.categories[0]?.name} stores</h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                {moreStores.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/stores/${s.slug}`} className="block overflow-hidden rounded-xl border border-neutral-200 transition hover:shadow-md">
                      <img src={s.banner || s.logo || FALLBACK_STORE_IMAGE} alt="" className="h-24 w-full object-cover" />
                      <p className="p-3 text-sm font-semibold text-neutral-800">{s.name}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 lg:sticky lg:top-48">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {open !== null && (
              <span className={`rounded-full px-2.5 py-1 font-medium ${open ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>{open ? "Open now" : "Closed"}</span>
            )}
            {store.rating != null && (
              <span className="rounded-full bg-corisio-yellow/15 px-2.5 py-1 font-medium text-neutral-700">★ {store.rating.toFixed(1)}{store.reviewCount ? ` (${store.reviewCount} reviews)` : ""}</span>
            )}
            {primary?.distanceKm != null && <span className="rounded-full bg-corisio-blue/10 px-2.5 py-1 font-medium text-corisio-blue">{formatKm(primary.distanceKm)} away</span>}
          </div>

          <dl className="mt-5 space-y-4 text-sm">
            {primary && <div><dt className={label}>Address</dt><dd className="mt-1 text-neutral-700">{primary.address}, {primary.region}</dd></div>}
            {store.openingHours && (
              <div>
                <dt className={label}>Hours{today ? ` · today ${today}` : ""}</dt>
                <dd className="mt-1">
                  <table className="w-full text-neutral-700">
                    <tbody>
                      {DAYS.map(({ key, label: day }) => {
                        const d = store.openingHours![key];
                        return (
                          <tr key={key}>
                            <td className="py-0.5 pr-3">{day.slice(0, 3)}</td>
                            <td className="py-0.5 text-right">{d.closed ? "Closed" : `${d.open}–${d.close}`}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </dd>
              </div>
            )}
            {(primary?.phone || store.phone) && <div><dt className={label}>Phone</dt><dd className="mt-1 text-neutral-700">{primary?.phone || store.phone}</dd></div>}
          </dl>

          {primary && (
            <a href={`https://www.openstreetmap.org/directions?to=${primary.latitude}%2C${primary.longitude}`} target="_blank" rel="noreferrer" className="mt-6 block rounded-lg bg-corisio-blue px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-corisio-blue/90">Get directions</a>
          )}
          {(primary?.phone || store.phone) && (
            <a href={`tel:${(primary?.phone || store.phone || "").replace(/[\s()-]/g, "")}`} className="mt-2 block rounded-lg border border-neutral-200 px-4 py-3 text-center text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50">Call store</a>
          )}
          {store.whatsapp && (
            <a href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="mt-2 block rounded-lg border border-neutral-200 px-4 py-3 text-center text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50">Chat on WhatsApp</a>
          )}
          {links.length > 0 && (
            <p className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {links.map(([k, v]) => (
                <a key={k} href={v as string} target="_blank" rel="noreferrer noopener" className="font-semibold capitalize text-corisio-blue hover:underline">{k === "x" ? "X" : k}</a>
              ))}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
