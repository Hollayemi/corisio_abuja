"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useListPublicStoresQuery } from "@/redux/slices/publicStoresApi";
import { useUserLocation } from "@/lib/location/hooks";
import { FALLBACK_STORE_IMAGE, formatKm, isStoreOpen } from "@/app/utils/geo";
import type { PublicStore } from "@/redux/types";
import { fadeUp, stagger, viewportOnce } from "../ui/motion";
import { NEARBY_RADIUS_KM } from "./PopularNearYou";

function StoreCard({ store }: { store: PublicStore }) {
  const open = isStoreOpen(store);
  const distance = store.locations[0]?.distanceKm;
  const area = store.locations[0]?.region;

  return (
    <Link
      href={`/stores/${store.slug}`}
      className="group block min-w-0 overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
    >
      <div className="relative aspect-[16/9] bg-neutral-100">
        <Image
          src={store.banner || store.logo || FALLBACK_STORE_IMAGE}
          alt=""
          fill
          sizes="(min-width: 1024px) 290px, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {open !== null && (
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${
              open ? "bg-green-600" : "bg-neutral-700"
            }`}
          >
            {open ? "Open now" : "Closed"}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-neutral-900">{store.name}</h3>
        <p className="mt-0.5 truncate text-xs text-neutral-500">
          {[typeof distance === "number" ? formatKm(distance) : null, area].filter(Boolean).join(" · ") ||
            store.tagline ||
            "Local store"}
        </p>
        {typeof store.rating === "number" && (
          <p className="mt-1 text-xs text-neutral-600">
            ★ {store.rating.toFixed(1)}
            {store.reviewCount ? ` (${store.reviewCount})` : ""}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function StoresNearYou() {
  const reduce = useReducedMotion();
  const { location } = useUserLocation();

  // With a location: stores in range, nearest first. Without: still show stores
  // (the backend returns them in default order), just without distances.
  const { data, isLoading } = useListPublicStoresQuery({
    sort: location ? "nearest" : "popular",
    radiusKm: location ? NEARBY_RADIUS_KM : undefined,
    limit: 8,
  });
  const stores = data?.data.items ?? [];

  return (
    <section
      aria-labelledby="stores-near-you-heading"
      className="mx-auto w-full max-w-[1240px] px-4 pb-12 sm:px-6 sm:pb-14"
    >
      <motion.div
        variants={reduce ? undefined : fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="flex items-baseline justify-between gap-4"
      >
        <h2 id="stores-near-you-heading" className="text-xl font-bold text-neutral-900 sm:text-2xl">
          🏪 Stores Near You
        </h2>
        <Link href="/stores" className="text-xs font-medium text-corisio-blue hover:underline sm:text-sm">
          Open the map →
        </Link>
      </motion.div>

      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[16/9] rounded-xl bg-neutral-200" />
              <div className="mt-2.5 h-4 w-2/3 rounded bg-neutral-200" />
              <div className="mt-2 h-3 w-1/2 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      ) : stores.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">No stores nearby yet.</p>
      ) : (
        <motion.div
          variants={stagger(0.06)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stores.map((s) => (
            <motion.div key={s.id} variants={reduce ? undefined : fadeUp}>
              <StoreCard store={s} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
