"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { StorefrontProduct } from "@/redux/types";
import ProductCard from "../ui/ProductCard";
import { fadeUp, stagger, viewportOnce } from "../ui/motion";

type ProductSectionProps = {
  id: string;
  title: string;
  viewAllHref: string;
  viewAllLabel?: string;
  products: StorefrontProduct[];
  isLoading?: boolean;
  /** Shown when the request finished but returned no products. */
  emptyMessage?: string;
};

const cardVariant = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function ProductSection({
  id,
  title,
  viewAllHref,
  viewAllLabel = "View all →",
  products,
  isLoading = false,
  emptyMessage = "No products to show right now.",
}: ProductSectionProps) {
  const reduce = useReducedMotion();
  const v = reduce ? { hidden: { opacity: 1 }, show: { opacity: 1 } } : cardVariant;

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="mx-auto w-full max-w-[1240px] px-4 pb-12 sm:px-6 sm:pb-14"
    >
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="flex items-baseline justify-between gap-4"
      >
        {/* <h2
          id={`${id}-heading`}
          className="text-xl font-bold text-neutral-900 sm:text-2xl"
        >
          {title}
        </h2> */}
        <div className="relative">
          <h2
            id="categories-heading"
            className="text-sm mt-6 font-semibold tracking-tight text-corisio-blue sm:text-xl"
          >
            {title}
          </h2>
          <div className="absolute h-0.5 ml-6 w-2/5 bg-corisio-yellow"></div>
        </div>
        <Link
          href={viewAllHref}
          className="text-xs font-medium text-corisio-blue hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-corisio-blue sm:text-sm"
        >
          {viewAllLabel}
        </Link>
      </motion.div>

      {isLoading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[11/10] rounded-xl bg-neutral-200" />
              <div className="mt-2.5 h-4 w-3/4 rounded bg-neutral-200" />
              <div className="mt-2 h-4 w-1/2 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="mt-6 text-xs text-center my-10 text-neutral-500">{emptyMessage}</p>
      ) : (
        <motion.div
          variants={stagger(0.06)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-5"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={v as any}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}