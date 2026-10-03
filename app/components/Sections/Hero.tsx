"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { EASE } from "../ui/motion";


const SLIDES = [
  {
    src: "/images/hero1.webp",
    eyebrow: "Everything nearby, in one place",
    title: ["Find what you need,", "right around the corner."],
    body:
      "Corisio connects you to trusted local stores so you can discover everyday essentials close to home — without the guesswork or the wait.",
  },
  {
    src: "/images/hero2.webp",
    eyebrow: "Local stores, made discoverable",
    title: ["The shops you know,", "now easy to find."],
    body:
      "Search a product, see which nearby stores have it, compare prices, and get directions in a single tap.",
  },
  {
    src: "/images/hero.webp",
    eyebrow: "Built for your neighbourhood",
    title: ["Your community,", "closer than ever."],
    body:
      "Support the stores on your street. Corisio puts local merchants on the map — literally.",
  },
];

const ROTATE_MS = 6500;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export default function Hero() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      ROTATE_MS
    );
    return () => clearInterval(t);
  }, [reduce]);

  const slide = SLIDES[index];
  const variants = reduce ? { hidden: { opacity: 1 }, show: { opacity: 1 } } : item;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-[#f5f8ef]"
    >
      {/* Fading background carousel */}
      <div className="absolute inset-0 -z-10">
        <AnimatePresence mode="sync">
          <motion.div
            key={slide.src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: EASE }}
            className="absolute inset-0"
          >
            <Image
              src={slide.src}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-right"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Readability overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[#f5f8ef]/95 via-[#f5f8ef]/75 to-transparent"
      />

      <div className="mx-auto flex min-h-[460px] w-full max-w-[1240px] items-center px-4 py-16 sm:min-h-[500px] sm:px-6 lg:min-h-[560px]">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-[540px]"
        >
          <AnimatePresence mode="wait">
            <motion.div key={index} variants={container} initial="hidden" animate="show">
              <motion.p
                variants={variants}
                className="text-xs font-medium uppercase tracking-[0.18em] text-corisio-blue/80 sm:text-sm"
              >
                {slide.eyebrow}
              </motion.p>

              <motion.h1
                variants={variants}
                id="hero-heading"
                className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-neutral-900 sm:text-5xl lg:text-[58px]"
              >
                <span className="block">{slide.title[0]}</span>
                <span className="block text-corisio-yellow">
                  {slide.title[1]}
                </span>
              </motion.h1>

              <motion.p
                variants={variants}
                className="mt-6 max-w-[460px] text-sm leading-relaxed text-neutral-700 sm:text-base"
              >
                {slide.body}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          <motion.div variants={variants} className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="inline-flex h-11 items-center rounded-lg bg-corisio-blue px-6 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
            >
              Find nearby stores
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex h-11 items-center rounded-lg border border-corisio-blue/20 bg-white/60 px-6 text-sm font-medium text-corisio-blue backdrop-blur-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
            >
              How Corisio works
            </Link>
          </motion.div>

          {/* Slide indicators */}
          <div className="mt-10 flex items-center gap-2" aria-hidden="true">
            {SLIDES.map((s, i) => (
              <span
                key={s.src}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === index
                    ? "w-8 bg-corisio-blue"
                    : "w-4 bg-corisio-blue/25"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}