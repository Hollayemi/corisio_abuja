"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { INTERVAL_UNIT, formatPlanPrice } from "@/app/data/subscription-data";
import { fadeUp, stagger, viewportOnce } from "@/app/components/ui/motion";
import { getErrorMessage } from "@/redux/config/errors";
import {
  MEMBERSHIP_CATALOGUE_REFETCH,
  useListMembershipPlansQuery,
} from "@/redux/slices/membershipApi";

const container = "mx-auto w-full max-w-[1100px] px-4 sm:px-6";

export default function MembershipPlans() {
  // Live plans: whatever staff have set up on the admin Membership page.
  const { data, currentData, isFetching, isError, error, refetch } = useListMembershipPlansQuery(
    undefined,
    MEMBERSHIP_CATALOGUE_REFETCH,
  );
  const plans = data?.data.items ?? [];
  const loading = currentData === undefined && isFetching;

  return (
    <section
      aria-labelledby="membership-plans-heading"
      className="bg-corisio-blue py-16 text-white sm:py-20 lg:py-24"
    >
      <div className={container}>
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="max-w-[560px]"
        >
          <motion.p
            variants={fadeUp}
            className="text-sm font-semibold uppercase tracking-wide text-white/60"
          >
            Membership
          </motion.p>
          <motion.h2
            variants={fadeUp}
            id="membership-plans-heading"
            className="mt-3 text-2xl font-bold leading-snug sm:text-3xl"
          >
            Choose the plan that <span className="text-corisio-yellow">fits you</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-sm leading-relaxed text-white/80">
            Whether you&apos;re shopping for yourself, your family or a business,
            there&apos;s a plan designed around your regular protein needs.
          </motion.p>
        </motion.div>

        {loading && (
          <ul aria-hidden="true" className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="h-80 animate-pulse rounded-2xl bg-white/10" />
            ))}
          </ul>
        )}

        {!loading && isError && (
          <div role="alert" className="mt-12 rounded-2xl bg-white/10 p-6 text-sm lg:mt-16">
            <p className="text-white/90">{getErrorMessage(error)}</p>
            <button
              type="button"
              onClick={refetch}
              className="mt-4 inline-flex h-10 items-center rounded-lg bg-corisio-yellow px-5 text-sm font-semibold text-black transition hover:brightness-95"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !isError && plans.length === 0 && (
          <p className="mt-12 rounded-2xl bg-white/10 p-6 text-sm text-white/80 lg:mt-16">
            Membership plans are coming soon. Check back shortly.
          </p>
        )}

        {plans.length > 0 && (
          <motion.ul
            variants={stagger(0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4"
          >
            {plans.map((plan) => (
              <motion.li
                key={plan.id}
                variants={fadeUp}
                className="flex flex-col rounded-2xl bg-white/10 p-6"
              >
                <p className="text-base font-semibold text-corisio-yellow">{plan.name}</p>
                <p className="mt-3 text-2xl font-bold text-white sm:text-[28px]">
                  {formatPlanPrice(plan.price)}
                  <span className="ml-1 text-sm font-normal text-white/60">
                    / {INTERVAL_UNIT[plan.interval]}
                  </span>
                </p>

                <Link
                  href={`/subscription/checkout?plan=${encodeURIComponent(plan.slug)}`}
                  className="mt-5 inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-corisio-yellow px-5 text-sm font-semibold text-black transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Subscribe <span aria-hidden="true">→</span>
                </Link>

                <p className="mt-6 text-sm leading-relaxed text-white/80">{plan.description}</p>

                {plan.supply.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm text-white/60">Weekly supply of:</p>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {plan.supply.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm leading-relaxed text-white/90"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2 size-1 shrink-0 rounded-full bg-white/60"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </section>
  );
}
