"use client";

import { motion } from "framer-motion";
import { HOW_IT_WORKS_STEPS } from "@/app/data/subscription-data";
import { fadeUp, stagger, viewportOnce } from "@/app/components/ui/motion";

const container = "mx-auto w-full max-w-[1100px] px-4 sm:px-6";

export default function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-heading" className="py-16 sm:py-20 lg:py-24">
      <div className={container}>
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mx-auto max-w-[600px] text-center"
        >
          <motion.p
            variants={fadeUp}
            className="text-sm font-semibold uppercase tracking-wide text-corisio-blue"
          >
            How to Earn Points
          </motion.p>
          <motion.h2
            variants={fadeUp}
            id="how-it-works-heading"
            className="mt-3 text-2xl font-bold leading-snug text-neutral-800 sm:text-3xl"
          >
            Set it once. We handle
            <br />
            the <span className="text-corisio-yellow">weekly supply.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-5 text-sm leading-relaxed text-neutral-500">
            Choose a plan that fits your needs, and get your regular protein supply
            delivered without having to reorder every week.
          </motion.p>
        </motion.div>

        <motion.ol
          variants={stagger(0.14)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-16 grid gap-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-8"
        >
          {HOW_IT_WORKS_STEPS.map((step, i) => {
            const last = i === HOW_IT_WORKS_STEPS.length - 1;
            return (
              <motion.li key={step.title} variants={fadeUp}>
                <div className="flex items-center">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-corisio-blue text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  {!last && (
                    <span
                      aria-hidden="true"
                      className="hidden h-px flex-1 bg-neutral-200 lg:-mr-8 lg:block"
                    />
                  )}
                </div>

                <h3 className="mt-6 text-base font-semibold text-neutral-900">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-neutral-500">
                  {step.description}
                </p>
              </motion.li>
            );
          })}
        </motion.ol>
      </div>
    </section>
  );
}