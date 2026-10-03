"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE, fadeUp, stagger, viewportOnce } from "../ui/motion";

type Heading = { lead: string; accent: string };

export type ServiceStep = {
  title: string;
  summary: string;
  detail: string;
};

export type ServicePageProps = {
  /** Full-width photo under the header (decorative) */
  bannerImage: string;
  intro: {
    heading: Heading;
    description: string;
    benefitsTitle: string;
    benefits: string[];
    cta: { label: string; href: string };
    image: {
      src: string;
      alt: string;
      /** "card" = rounded photo, "cutout" = product shot with no background */
      style: "card" | "cutout";
    };
    imageSide: "left" | "right";
  };
  howItWorks: {
    heading: Heading;
    description: string;
    steps: ServiceStep[];
  };
};

const container = "mx-auto w-full max-w-[1100px] px-4 sm:px-6";

function BenefitIcon() {
  return (
    <span
      aria-hidden="true"
      className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-corisio-yellow/60"
    >
      <span className="size-2.5 rounded-full border border-corisio-yellow bg-corisio-yellow/20" />
    </span>
  );
}

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export default function ServicePage({
  bannerImage,
  intro,
  howItWorks,
}: ServicePageProps) {
  const imageFirst = intro.imageSide === "left";
  const reduce = useReducedMotion();
  const v = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : itemVariant;

  return (
    <div>
      {/* Banner: slow zoom-in on mount */}
      <div className="relative h-[200px] w-full overflow-hidden bg-neutral-200 sm:h-[260px] lg:h-[320px]">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: EASE }}
          className="absolute inset-0"
        >
          <Image
            src={bannerImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </div>

      {/* Intro */}
      <section
        aria-labelledby="service-heading"
        className={`${container} py-14 sm:py-20 lg:py-24`}
      >
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          {/* Text column */}
          <motion.div
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className={imageFirst ? "lg:order-2" : ""}
          >
            <motion.h1
              variants={v}
              id="service-heading"
              className="text-3xl font-bold leading-tight text-neutral-800 sm:text-4xl"
            >
              {intro.heading.lead}{" "}
              <span className="text-corisio-yellow">{intro.heading.accent}</span>
            </motion.h1>

            <motion.p
              variants={v}
              className="mt-6 max-w-[440px] text-sm leading-relaxed text-neutral-500 sm:text-[15px]"
            >
              {intro.description}
            </motion.p>

            <motion.h2
              variants={v}
              className="mt-9 text-base font-semibold text-neutral-900"
            >
              {intro.benefitsTitle}
            </motion.h2>

            <motion.ul
              variants={stagger(0.08)}
              className="mt-5 flex flex-col gap-4"
            >
              {intro.benefits.map((benefit) => (
                <motion.li
                  key={benefit}
                  variants={v}
                  className="flex items-center gap-4 text-sm text-neutral-600"
                >
                  <BenefitIcon />
                  {benefit}
                </motion.li>
              ))}
            </motion.ul>

            <motion.div variants={v}>
              <Link
                href={intro.cta.href}
                className="mt-10 inline-flex h-12 items-center gap-2 rounded-lg bg-corisio-blue px-6 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
              >
                {intro.cta.label} <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Image column */}
          <motion.div
            initial={
              reduce ? { opacity: 0 } : { opacity: 0, x: imageFirst ? -40 : 40 }
            }
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.8, ease: EASE }}
            className={imageFirst ? "lg:order-1" : ""}
          >
            {intro.image.style === "card" ? (
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[390px] overflow-hidden rounded-[32px] bg-neutral-100">
                <Image
                  src={intro.image.src}
                  alt={intro.image.alt}
                  fill
                  sizes="(min-width: 1024px) 390px, 90vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative mx-auto aspect-square w-full max-w-[440px]">
                <Image
                  src={intro.image.src}
                  alt={intro.image.alt}
                  fill
                  sizes="(min-width: 1024px) 440px, 90vw"
                  className="object-contain"
                />
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        className="bg-corisio-blue py-16 text-white sm:py-24"
      >
        <div className={container}>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
          >
            <p className="text-sm uppercase tracking-wide text-white/70">
              How it works
            </p>

            <h2
              id="how-it-works-heading"
              className="mt-3 text-3xl font-bold leading-tight sm:text-4xl"
            >
              <span className="block">{howItWorks.heading.lead}</span>
              <span className="block text-corisio-yellow">
                {howItWorks.heading.accent}
              </span>
            </h2>

            <p className="mt-6 max-w-[560px] text-sm leading-relaxed text-white/90">
              {howItWorks.description}
            </p>
          </motion.div>

          <motion.ol
            variants={stagger(0.14)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-14 grid gap-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-10"
          >
            {howItWorks.steps.map((step, i) => {
              const last = i === howItWorks.steps.length - 1;
              return (
                <motion.li key={step.title} variants={v}>
                  <div className="flex items-center">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-corisio-yellow text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    {!last && (
                      <span
                        aria-hidden="true"
                        className="hidden h-px flex-1 bg-white/40 lg:-mr-10 lg:block"
                      />
                    )}
                  </div>

                  <h3 className="mt-8 max-w-[200px] text-lg font-semibold leading-snug text-corisio-yellow">
                    {step.title}
                  </h3>
                  <p className="mt-5 max-w-[220px] text-sm text-white/90">
                    {step.summary}
                  </p>
                  <p className="mt-5 max-w-[230px] text-sm leading-relaxed text-white/80">
                    {step.detail}
                  </p>
                </motion.li>
              );
            })}
          </motion.ol>
        </div>
      </section>
    </div>
  );
}