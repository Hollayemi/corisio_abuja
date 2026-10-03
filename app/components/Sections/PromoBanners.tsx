"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { EASE, viewportOnce } from "../ui/motion";

export default function PromoBanners() {
  const reduce = useReducedMotion();

  const fromLeft = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, x: -32 },
        show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
      };

  const fromRight = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, x: 32 },
        show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
      };

  return (
    <section
      aria-label="Promotions"
      className="mx-auto w-full max-w-[1240px] px-4 pb-12 sm:px-6 sm:pb-14"
    >
      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <motion.article
          variants={fromLeft}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="relative isolate min-h-[250px] overflow-hidden rounded-2xl bg-luxol-greeen text-white sm:min-h-[270px]"
        >
          <Image
            src="/images/flyer1.webp"
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, 50vw"
            className="object-contain"
          />
        </motion.article>

        <motion.article
          variants={fromRight}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="relative isolate min-h-[250px] overflow-hidden rounded-2xl bg-[#d6eadb] sm:min-h-[270px]"
        >
          <Image
            src="/images/flyer2.webp"
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, 50vw"
            className="object-contain"
          />
        </motion.article>
      </div>
    </section>
  );
}