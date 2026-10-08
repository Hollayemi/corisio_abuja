"use client";

import ProductSection from "./ProductSection";
import { useListStorefrontProductsQuery } from "@/redux/slices/catalogApi";
import { useUserLocation } from "@/lib/location/hooks";

/** Distance used for "near you" on the landing page. */
export const NEARBY_RADIUS_KM = 10;

export default function PopularNearYou() {
  const { location, locate, isLocating, status } = useUserLocation();

  // Without a location the backend can't tell what's near, so don't ask it.
  const { data, isLoading } = useListStorefrontProductsQuery(
    { sort: "best-selling", radiusKm: NEARBY_RADIUS_KM, perPage: 6 },
    { skip: !location },
  );

  if (!location) {
    return (
      <section
        aria-labelledby="popular-near-you-heading"
        className="mx-auto w-full max-w-[1240px] px-4 pb-12 sm:px-6 sm:pb-14"
      >
        <h2 id="popular-near-you-heading" className="text-xl font-bold text-neutral-900 sm:text-2xl">
          📍 Popular Near You
        </h2>
        <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl bg-[#f5f8ef] p-6">
          <p className="text-sm text-neutral-700">
            Share your location to see what people around you are buying.
          </p>
          <button
            type="button"
            onClick={() => void locate()}
            disabled={isLocating}
            className="inline-flex h-10 items-center rounded-lg bg-corisio-blue px-5 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {isLocating ? "Finding you…" : "Use my location"}
          </button>
          {status === "denied" && (
            <p className="text-xs text-neutral-500">
              Location is blocked in your browser. Allow it in site settings and try again.
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <ProductSection
      id="popular-near-you"
      title="📍 Popular Near You"
      viewAllHref="/shop?sort=nearest"
      viewAllLabel="View all nearby →"
      products={data?.data.items ?? []}
      isLoading={isLoading}
      emptyMessage="Nothing popular within reach yet — try the stores map."
    />
  );
}
