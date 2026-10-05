import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatNaira, getStore, isOpenNow, stores } from "@/app/data/stores";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return stores.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const store = getStore((await params).slug);
  return store ? { title: store.name, description: store.tagline } : { title: "Store not found" };
}

export default async function StorePage({ params }: { params: Params }) {
  const store = getStore((await params).slug);
  if (!store) notFound();

  const open = isOpenNow(store);
  const allDay = store.hours.open === 0 && store.hours.close === 24;
  const directions = `https://www.openstreetmap.org/directions?to=${store.lat}%2C${store.lng}`;
  const more = stores.filter((s) => s.slug !== store.slug && s.category === store.category).slice(0, 3);

  return (
    <div>
      <div className="relative h-[220px] w-full bg-neutral-200 sm:h-[300px]">
        <Image src={store.image} alt={store.name} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[1100px] px-4 pb-6 text-white sm:px-6">
          <Link href={`/stores`} className="text-xs font-medium text-white/80 hover:text-white">← Back to map</Link>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-corisio-yellow">{store.categoryLabel}</p>
          <h1 className="text-2xl font-bold sm:text-4xl">{store.name}</h1>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1100px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-[15px] leading-relaxed text-neutral-600">{store.tagline}</p>

          <h2 className="mt-10 text-xl font-bold text-neutral-800">Products available</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {store.products.map((p) => (
              <li key={p.name} className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <div className="relative aspect-square bg-neutral-50">
                  <Image src={p.image} alt={p.name} fill sizes="(min-width:640px) 240px, 100vw" className="object-contain p-4" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-neutral-700">{p.name}</p>
                  <p className="mt-1 text-sm font-bold text-corisio-blue">{formatNaira(p.price)}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-neutral-400">Prices and availability are set by the store. Call ahead to confirm stock.</p>

          {more.length > 0 && (
            <>
              <h2 className="mt-12 text-xl font-bold text-neutral-800">More {store.categoryLabel} stores</h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                {more.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/stores/${s.slug}`} className="block overflow-hidden rounded-xl border border-neutral-200 transition hover:shadow-md">
                      <div className="relative h-24"><Image src={s.image} alt="" fill sizes="240px" className="object-cover" /></div>
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
            <span className={`rounded-full px-2.5 py-1 font-medium ${open ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>{open ? "Open now" : "Closed"}</span>
            <span className="rounded-full bg-corisio-yellow/15 px-2.5 py-1 font-medium text-neutral-700">★ {store.rating} ({store.reviews} reviews)</span>
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <div><dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Address</dt><dd className="mt-1 text-neutral-700">{store.address}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Hours</dt><dd className="mt-1 text-neutral-700">{allDay ? "Open 24 hours" : `Daily, ${store.hours.open}:00–${store.hours.close}:00`}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Phone</dt><dd className="mt-1 text-neutral-700">{store.phone}</dd></div>
          </dl>
          <a href={directions} target="_blank" rel="noreferrer" className="mt-6 block rounded-lg bg-corisio-blue px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-corisio-blue/90">Get directions</a>
          <a href={`tel:${store.phone.replace(/\s/g, "")}`} className="mt-2 block rounded-lg border border-neutral-200 px-4 py-3 text-center text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50">Call store</a>
        </aside>
      </div>
    </div>
  );
}