"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { FlexIcon } from "@/app/components/ui/icons";
import { FLEXIBILITY_POINTS } from "@/app/data/subscription-data";
import { fadeUp, stagger, viewportOnce } from "@/app/components/ui/motion";

const container = "mx-auto w-full max-w-[1100px] px-4 sm:px-6";

export default function Flexibility() {
  const reduce = useReducedMotion();

  return (
    <section aria-labelledby="flexibility-heading" className="py-16 sm:py-20 lg:py-24">
      <div className={container}>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.7 }}
            className="relative mx-auto aspect-square w-full max-w-[360px] overflow-hidden rounded-[28px] bg-neutral-100"
          >
            <Image
              src="/images/crown.png"
              alt="A gold VIP membership badge"
              fill
              sizes="(min-width: 1024px) 360px, 80vw"
              className="object-contain p-8"
            />
          </motion.div>

          <motion.div
            variants={stagger(0.1)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
          >
            <motion.h2
              variants={fadeUp}
              id="flexibility-heading"
              className="text-2xl font-bold leading-snug text-neutral-900 sm:text-3xl"
            >
              Need <span className="text-corisio-yellow">more flexibility?</span>
              <br />
              Your plan should fit your life.
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-[480px] text-sm leading-relaxed text-neutral-500"
            >
              Going away for a while? Need more protein this month? Your household
              changed?
              <br />
              You can manage your membership without starting over.
            </motion.p>

            <motion.ul variants={stagger(0.06)} className="mt-7 flex flex-col gap-4">
              {FLEXIBILITY_POINTS.map((point) => (
                <motion.li
                  key={point}
                  variants={fadeUp}
                  className="flex items-center gap-3 text-sm text-neutral-700"
                >
                  <FlexIcon className="size-5 shrink-0 text-corisio-yellow" />
                  {point}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}