"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE, fadeUp, stagger, viewportOnce } from "../ui/motion";

type Feature = {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  /** Image path under /public/features/ */
  image: string;
  cardClass: string;
  titleClass: string;
  buttonClass: string;
};

const features: Feature[] = [
  {
    eyebrow: "Your Meat, Your Way",
    title: "Build Meat Box",
    description: "Stock up on the cuts your household loves.",
    cta: "Build Now",
    href: "/meat-box",
    image: "/images/meat.png",
    cardClass: "bg-[#e8f2e4]",
    titleClass: "text-corisio-blue",
    buttonClass: "bg-corisio-blue text-white hover:brightness-110",
  },
  {
    eyebrow: "Stock Smarter",
    title: "Plan Your Freezer",
    description: "Plan your grocery smarter and never run out.",
    cta: "Plan Now",
    href: "/freezer-planner",
    image: "/images/basket.png",
    cardClass: "bg-[#fdf3d6]",
    titleClass: "text-corisio-yellow",
    buttonClass: "bg-corisio-yellow text-black hover:brightness-95",
  },
  {
    eyebrow: "More Value, Every Time",
    title: "Membership",
    description: "Save more with exclusive benefits and rewards.",
    cta: "View Plans",
    href: "/membership",
    image: "/images/crown.png",
    cardClass: "bg-[#fde8ec]",
    titleClass: "text-corisio-blue",
    buttonClass: "bg-corisio-blue text-white hover:brightness-110",
  },
];

const cardVariant = {
  hidden: { opacity: 0, y: 26, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE },
  },
};

export default function MainFeatures() {
  const reduce = useReducedMotion();
  const v = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : cardVariant;

  return (
    <section
      aria-labelledby="features-heading"
      className="mx-auto w-full max-w-[1240px] px-4 pb-14 pt-8 sm:px-6 sm:pb-16 sm:pt-12"
    >
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="text-center"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-600 sm:text-sm">
          Our main features
        </p>

        <h2
          id="features-heading"
          className="mt-3 text-3xl font-bold leading-tight text-neutral-800 sm:text-4xl"
        >
          More than just your
          <span className="block text-corisio-yellow">everyday shop.</span>
        </h2>

        <p className="mx-auto mt-4 max-w-[520px] text-sm leading-relaxed text-neutral-500">
          Build, plan and subscribe to services designed to make buying quality
          food simpler and more convenient.
        </p>
      </motion.div>

      <motion.ul
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-10 grid gap-5 lg:grid-cols-3"
      >
        {features.map((f) => (
          <motion.li key={f.title} variants={v}>
            <motion.article
              whileHover={reduce ? undefined : { y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className={`relative isolate flex h-full min-h-[220px] overflow-hidden rounded-2xl p-6 sm:p-7 ${f.cardClass}`}
            >
              <motion.div
                whileHover={reduce ? undefined : { scale: 1.04 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-[48%]"
              >
                <Image
                  src={f.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 200px, 45vw"
                  className="object-contain object-right-bottom"
                />
              </motion.div>

              <div className="flex max-w-[88%] flex-col items-start">
                <p className="text-xs text-neutral-600 sm:text-sm">
                  {f.eyebrow}
                </p>

                <h3
                  className={`mt-1 text-2xl font-bold leading-tight sm:text-[26px] ${f.titleClass}`}
                >
                  {f.title}
                </h3>

                <p className="mt-2 max-w-[210px] text-xs leading-relaxed text-neutral-600 sm:text-sm">
                  {f.description}
                </p>

                <Link
                  href={f.href}
                  className={`mt-5 inline-flex h-10 items-center gap-1.5 rounded-lg px-5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue ${f.buttonClass}`}
                >
                  {f.cta} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </motion.article>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}