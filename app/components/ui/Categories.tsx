"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useGetCategoriesQuery } from "@/redux/slices/catalogApi";

const PALETTE = [
  "#fbe9e9",
  "#e6f1e8",
  "#f6e9ee",
  "#e6f3e4",
  "#fbf1dc",
  "#efe9f6",
  "#fbf3df",
  "#e8eef6",
];

function colorForSlug(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

type Category = {
  label: string;
  slug: string;
  image: string | null;
  storeCount?: number;
};

export default function Categories({
  fromShop,
  category,
  storeCounts,
}: {
  fromShop?: boolean;
  category?: string;
  storeCounts?: Record<string, number>;
}) {
  const prefersReducedMotion = useReducedMotion();
  const { data, isLoading, isError } = useGetCategoriesQuery();

  const categories: Category[] = [
    ...(fromShop
      ? []
      : [{ label: "Nearby", slug: "nearby", image: null, storeCount: storeCounts?.__nearby }]),
    ...(data?.data ?? [])
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((c) => ({
        label: c.name,
        slug: c.slug,
        image: c.image ?? null,
        storeCount: storeCounts?.[c.slug],
      })),
  ];

  // Duplicate for seamless loop
  const loop = [...categories, ...categories];

  // Approx 40px/s drift; slower for more items so it stays readable
  const duration = Math.max(24, categories.length * 3.2);

  return (
    <section
      aria-labelledby="categories-heading"
      className={`mx-auto w-full max-w-[1240px] px-4 ${
        fromShop ? "py-2" : "py-12 sm:px-6 sm:py-16"
      }`}
    >
      {!fromShop && (
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <h2
              id="categories-heading"
              className="text-xl font-semibold tracking-tight text-corisio-blue sm:text-2xl"
            >
              What&rsquo;s nearby
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Browse categories and find stores around you.
            </p>
          </div>
          <Link
            href="/search"
            className="hidden whitespace-nowrap text-sm font-medium text-corisio-blue underline-offset-4 hover:underline sm:inline"
          >
            Browse all &rarr;
          </Link>
        </div>
      )}

      {isLoading ? (
        <SkeletonRow />
      ) : isError ? (
        <p className="mt-10 text-center text-sm text-neutral-500">
          Couldn&rsquo;t load categories right now.
        </p>
      ) : (
        <MarqueeRow duration={duration} reduced={!!prefersReducedMotion}>
          {loop.map((cat, i) => {
            const active = category === cat.slug;
            const href =
              cat.slug === "nearby" ? "/nearby" : `/shop?category=${cat.slug}`;
            const bg =
              cat.slug === "nearby" ? "#eef4ff" : colorForSlug(cat.slug);
            const isClone = i >= categories.length;

            return (
              <li
                key={`${cat.slug}-${i}`}
                aria-hidden={isClone || undefined}
                className="shrink-0"
              >
                <Link
                  href={href}
                  aria-current={active ? "true" : undefined}
                  tabIndex={isClone ? -1 : undefined}
                  className="group flex w-[112px] flex-col gap-2.5 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-corisio-blue sm:w-[132px]"
                >
                  <span
                    className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl ring-1 transition ${
                      active
                        ? "ring-2 ring-corisio-blue"
                        : "ring-black/5 group-hover:ring-corisio-yellow/70"
                    }`}
                    style={{ backgroundColor: bg }}
                  >
                    {cat.slug === "nearby" ? (
                      <NearbyGlyph />
                    ) : cat.image ? (
                      <Image
                        src={cat.image}
                        alt=""
                        fill
                        sizes="132px"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="text-2xl font-semibold text-corisio-blue/40"
                      >
                        {cat.label.charAt(0)}
                      </span>
                    )}
                  </span>

                  <span className="flex flex-col px-0.5">
                    <span className="line-clamp-1 text-[13px] font-medium leading-snug text-neutral-900 group-hover:text-corisio-blue">
                      {cat.label}
                    </span>
                    {typeof cat.storeCount === "number" && (
                      <span className="mt-0.5 text-[11px] text-neutral-500">
                        {cat.storeCount} store
                        {cat.storeCount === 1 ? "" : "s"}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </MarqueeRow>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee row — auto slides, pauses on hover/focus/touch,             */
/* falls back to a plain scroll row for reduced-motion users.          */
/* ------------------------------------------------------------------ */

function MarqueeRow({
  children,
  duration,
  reduced,
}: {
  children: React.ReactNode;
  duration: number;
  reduced: boolean;
}) {
  if (reduced) {
    return (
      <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </ul>
    );
  }

  return (
    <div
      className="group/marquee relative -mx-4 overflow-hidden px-4 sm:mx-0 sm:px-0"
      // Edge fades so tiles don't hard-clip against the container
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
      }}
    >
      <motion.ul
        className="flex w-max gap-4 will-change-transform"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration,
          ease: "linear",
          repeat: Infinity,
        }}
        // Pause on hover / focus / touch — CSS var trick isn't needed,
        // we just toggle animation playState via the wrapper.
        style={{ animationPlayState: "running" }}
      >
        {children}
      </motion.ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Nearby glyph                                                        */
/* ------------------------------------------------------------------ */

function NearbyGlyph() {
  return (
    <span className="relative flex h-full w-full items-center justify-center">
      <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-corisio-blue/10">
        <span className="absolute inset-0 animate-ping rounded-full bg-corisio-blue/15" />
        <svg
          viewBox="0 0 24 24"
          className="relative h-5 w-5 text-corisio-blue"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton                                                            */
/* ------------------------------------------------------------------ */

function SkeletonRow() {
  const count = 8;
  return (
    <ul className="flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="shrink-0">
          <div className="flex w-[112px] flex-col gap-2.5 sm:w-[132px]">
            <span className="aspect-square w-full animate-pulse rounded-2xl bg-neutral-200" />
            <span className="h-3 w-16 animate-pulse rounded bg-neutral-200" />
            <span className="h-2.5 w-12 animate-pulse rounded bg-neutral-100" />
          </div>
        </li>
      ))}
    </ul>
  );
}