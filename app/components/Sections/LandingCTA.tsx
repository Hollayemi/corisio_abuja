"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, viewportOnce } from "../ui/motion";

export default function LandingCTA() {
  const reduce = useReducedMotion();

  return (
    <section aria-labelledby="cta-heading" className="mx-auto w-full max-w-[1240px] px-4 pb-16 sm:px-6">
      <motion.div
        variants={reduce ? undefined : fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="rounded-2xl bg-corisio-blue px-6 py-12 text-center text-white sm:px-12"
      >
        <h2 id="cta-heading" className="text-2xl font-bold sm:text-3xl">
          Ready to shop your neighbourhood?
        </h2>
        <p className="mx-auto mt-3 max-w-[480px] text-sm text-white/80 sm:text-base">
          Find what you need from trusted stores around the corner, or put your own store on the map.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/stores"
            className="inline-flex h-11 items-center rounded-lg bg-corisio-yellow px-6 text-sm font-medium text-black transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Find stores near me
          </Link>
          <Link
            href="/business"
            className="inline-flex h-11 items-center rounded-lg border border-white/40 px-6 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Sell on Corisio
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
