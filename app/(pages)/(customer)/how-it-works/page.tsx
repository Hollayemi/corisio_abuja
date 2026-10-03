"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/app/components/ui/motion";
/* ------------------------------------------------------------------ */
/* Shared motion                                                       */
/* ------------------------------------------------------------------ */

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE
    
   } },
};

const sectionContainer = "mx-auto w-full max-w-[960px] px-4 sm:px-6";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    n: "01",
    title: "Search for what you need",
    body:
      "Type a product — \u201cUSB-C charger\u201d, \u201cfresh tomatoes\u201d, \u201cparacetamol\u201d. Corisio doesn\u2019t just show you an endless catalogue. It looks at what\u2019s actually around you.",
    icon: SearchGlyph,
  },
  {
    n: "02",
    title: "See which nearby stores have it",
    body:
      "We check stores within your radius and show you who has the item in stock, at what price, and how far away they are. Real stores, real availability.",
    icon: StoreGlyph,
  },
  {
    n: "03",
    title: "Compare and choose",
    body:
      "Sort by distance, price, or rating. Every result is a physical store you can walk or drive to — not a warehouse three states away.",
    icon: CompareGlyph,
  },
  {
    n: "04",
    title: "Get directions and go",
    body:
      "Tap a store and Corisio routes you there. No guessing, no calling ahead, no wandering the market. You know exactly where you\u2019re going and what you\u2019ll find.",
    icon: RouteGlyph,
  },
];

const FAQS = [
  {
    q: "Is Corisio a delivery service?",
    a: "No. Corisio is a discovery platform. We help you find which local stores have what you need, then get you there. Some stores may offer their own delivery \u2014 you\u2019ll see that on their store page.",
  },
  {
    q: "How do you know what stores have in stock?",
    a: "Stores update their inventory directly through Corisio. Where a store hasn\u2019t updated recently, we show the last known availability and mark it accordingly. We never claim certainty we don\u2019t have.",
  },
  {
    q: "How many stores are on Corisio?",
    a: "It depends on your area. We\u2019re onboarding stores city by city, starting with neighbourhoods where we can guarantee coverage. If your area is thin, tell us \u2014 it moves you up the list.",
  },
  {
    q: "Do I pay to use Corisio?",
    a: "Searching, comparing, and getting directions is free. Some advanced map features \u2014 like re-routing, saving multiple routes, or route history \u2014 use Corisio Points, which you can top up when you need them.",
  },
  {
    q: "How do I get my store listed?",
    a: "Tap \u201cFor Businesses\u201d and fill the short form. We\u2019ll reach out, verify your store, and help you list your first products. Onboarding is free during our launch phase.",
  },
  {
    q: "What if a store doesn\u2019t have the item when I arrive?",
    a: "Tell us through the store page. Reported mismatches feed back into how we rank that store\u2019s reliability. Stores that keep inventory accurate stay visible; stores that don\u2019t get demoted.",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function HowItWorksPage() {
  const reduce = useReducedMotion();
  const v = reduce ? { hidden: { opacity: 1 }, show: { opacity: 1 } } : item;

  return (
    <main className="bg-[#f7f9f4] text-neutral-900">
      {/* ------------------------------------------------------------ */}
      {/* Hero                                                          */}
      {/* ------------------------------------------------------------ */}
      <section className="border-b border-black/5 bg-[#f5f8ef]">
        <div className={sectionContainer}>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-[640px] py-20 sm:py-28"
          >
            <motion.p
              variants={v}
              className="text-xs font-medium uppercase tracking-[0.18em] text-corisio-blue/70 sm:text-sm"
            >
              How Corisio works
            </motion.p>

            <motion.h1
              variants={v}
              className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight text-neutral-900 sm:text-5xl lg:text-[56px]"
            >
              Find what you need,
              <span className="block text-corisio-yellow">
                from stores right around you.
              </span>
            </motion.h1>

            <motion.p
              variants={v}
              className="mt-6 text-base leading-relaxed text-neutral-700 sm:text-lg"
            >
              Corisio is the fastest way to find a product at a nearby store
              and get there. No catalogue of things you can\u2019t reach. No
              waiting. Just what\u2019s actually close to you, right now.
            </motion.p>

            <motion.div variants={v} className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/search"
                className="inline-flex h-11 items-center rounded-lg bg-corisio-blue px-6 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
              >
                Find nearby stores
              </Link>
              <Link
                href="/for-businesses"
                className="inline-flex h-11 items-center rounded-lg border border-corisio-blue/20 bg-white px-6 text-sm font-medium text-corisio-blue transition hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
              >
                I own a store
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* The problem / the promise                                     */}
      {/* ------------------------------------------------------------ */}
      <section className="border-b border-black/5 bg-white">
        <div className={sectionContainer}>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="grid gap-10 py-16 sm:py-20 md:grid-cols-2 md:gap-16"
          >
            <motion.div variants={v}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                The problem
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                You know what you need. You don&rsquo;t know where to find it.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-neutral-600">
                Online shops deliver in days. Market trips cost you an
                afternoon. And calling five stores to ask if they have one
                item is nobody&rsquo;s idea of a good time.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">
                The things you actually need are almost always within a few
                kilometres of you. The problem isn&rsquo;t supply &mdash;
                it&rsquo;s visibility.
              </p>
            </motion.div>

            <motion.div variants={v}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-corisio-blue/60">
                What Corisio does
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                We make local stores discoverable.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-neutral-600">
                Corisio sits between you and the shops on your street. You
                search once, we tell you who has it, and we route you there.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">
                For stores, Corisio is a new front door &mdash; a way to be
                found by the people already nearby, looking for exactly what
                they sell.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* The four steps                                                */}
      {/* ------------------------------------------------------------ */}
      <section className="border-b border-black/5 bg-[#f7f9f4]">
        <div className={sectionContainer}>
          <div className="pt-16 sm:pt-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-corisio-blue/70">
              The four steps
            </p>
            <h2 className="mt-3 max-w-[560px] text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
              From &ldquo;I need this&rdquo; to &ldquo;I&rsquo;m on my
              way&rdquo; in four moves.
            </h2>
          </div>

          <motion.ol
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-12 grid gap-5 pb-16 sm:mt-14 sm:pb-20 md:grid-cols-2 md:gap-6"
          >
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.n}
                  variants={v}
                  className="group relative flex flex-col gap-5 rounded-2xl border border-black/5 bg-white p-6 transition hover:border-corisio-blue/20 hover:shadow-[0_12px_32px_-16px_rgba(30,42,120,0.15)] sm:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-corisio-blue/8 text-corisio-blue">
                      <Icon />
                    </span>
                    <span className="text-[11px] font-semibold tracking-[0.14em] text-neutral-300">
                      {step.n}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-neutral-900 sm:text-[17px]">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">
                      {step.body}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </motion.ol>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Worked example                                                */}
      {/* ------------------------------------------------------------ */}
      <section className="border-b border-black/5 bg-white">
        <div className={sectionContainer}>
          <div className="py-16 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              A real example
            </p>
            <h2 className="mt-3 max-w-[560px] text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
              &ldquo;I need a USB-C charger.&rdquo;
            </h2>
            <p className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-neutral-600">
              Here&rsquo;s what Corisio shows you after a single search.
              These are stores within walking or short driving distance.
            </p>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-10 overflow-hidden rounded-2xl border border-black/5"
            >
              {/* Search bar mock */}
              <motion.div
                variants={v}
                className="flex flex-col gap-2 border-b border-black/5 bg-[#f7f9f4] px-5 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
              >
                <div className="flex h-10 flex-1 items-center gap-2.5 rounded-lg border border-black/5 bg-white px-3.5">
                  <SearchGlyph className="h-4 w-4 shrink-0 text-neutral-400" />
                  <span className="text-[13px] text-neutral-700">
                    usb-c charger
                  </span>
                  <span className="ml-auto hidden text-[11px] text-neutral-400 sm:inline">
                    within 3 km
                  </span>
                </div>
              </motion.div>

              {/* Results */}
              <ul className="divide-y divide-black/5">
                {[
                  { name: "Kasuwa Electronics", dist: "0.8 km", price: "\u20a615,000", tag: "Closest" },
                  { name: "Wuse Digital Hub", dist: "1.4 km", price: "\u20a613,500", tag: "Best price" },
                  { name: "Emab Plaza Store B12", dist: "2.1 km", price: "\u20a614,000" },
                ].map((r) => (
                  <motion.li
                    key={r.name}
                    variants={v}
                    className="flex flex-col gap-3 bg-white px-5 py-4 transition hover:bg-[#f7f9f4] sm:flex-row sm:items-center sm:gap-5 sm:px-6"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-corisio-blue/8 text-corisio-blue">
                        <StoreGlyph className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-medium text-neutral-900">
                          {r.name}
                        </p>
                        <p className="mt-0.5 text-[12px] text-neutral-500">
                          {r.dist} away
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-5">
                      <span className="text-[14px] font-semibold text-neutral-900">
                        {r.price}
                      </span>
                      {r.tag && (
                        <span className="rounded-full bg-corisio-yellow/25 px-2.5 py-1 text-[11px] font-medium text-corisio-blue">
                          {r.tag}
                        </span>
                      )}
                      <button
                        type="button"
                        className="ml-auto inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-corisio-blue/15 bg-white px-3 text-[12px] font-medium text-corisio-blue transition hover:border-corisio-blue/30 sm:ml-0"
                      >
                        Directions
                        <ArrowGlyph className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <p className="mt-4 text-[13px] text-neutral-500">
              Prices and distances are illustrative. Real results depend on
              stores near you.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Points / premium map features                                 */}
      {/* ------------------------------------------------------------ */}
      <section className="border-b border-black/5 bg-[#f7f9f4]">
        <div className={sectionContainer}>
          <div className="grid gap-10 py-16 sm:py-20 md:grid-cols-2 md:gap-16">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.p
                variants={v}
                className="text-xs font-semibold uppercase tracking-[0.16em] text-corisio-blue/70"
              >
                Corisio Points
              </motion.p>
              <motion.h2
                variants={v}
                className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl"
              >
                Free for the everyday. Points for the extras.
              </motion.h2>
              <motion.p
                variants={v}
                className="mt-5 text-[15px] leading-relaxed text-neutral-600"
              >
                Searching, comparing stores, and getting a single set of
                directions is free &mdash; and always will be. If you want
                more from the map &mdash; re-routing, saving multiple
                routes, route history, or advanced filters &mdash; those use
                Corisio Points.
              </motion.p>
              <motion.p
                variants={v}
                className="mt-4 text-[15px] leading-relaxed text-neutral-600"
              >
                Points keep the free experience genuinely free. People who
                use heavy map features pay for them; everyone else
                doesn&rsquo;t.
              </motion.p>
            </motion.div>

            <motion.ul
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="flex flex-col gap-3 self-center"
            >
              {[
                { label: "Search, compare, and store pages", free: true },
                { label: "One set of directions per search", free: true },
                { label: "Save stores to your list", free: true },
                { label: "Re-routing and alternate routes", free: false },
                { label: "Route history and multi-stop trips", free: false },
                { label: "Advanced availability filters", free: false },
              ].map((row) => (
                <motion.li
                  key={row.label}
                  variants={v}
                  className="flex items-center gap-3 rounded-xl border border-black/5 bg-white px-4 py-3.5"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      row.free
                        ? "bg-corisio-blue/10 text-corisio-blue"
                        : "bg-corisio-yellow/30 text-corisio-blue"
                    }`}
                  >
                    {row.free ? (
                      <CheckGlyph className="h-3.5 w-3.5" />
                    ) : (
                      <SparkGlyph className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <span className="text-[14px] text-neutral-800">
                    {row.label}
                  </span>
                  <span
                    className={`ml-auto whitespace-nowrap text-[11px] font-medium uppercase tracking-wider ${
                      row.free ? "text-neutral-400" : "text-corisio-blue/70"
                    }`}
                  >
                    {row.free ? "Free" : "Points"}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* For businesses                                                */}
      {/* ------------------------------------------------------------ */}
      <section className="border-b border-black/5 bg-corisio-blue text-white">
        <div className={sectionContainer}>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="grid gap-10 py-16 sm:py-20 md:grid-cols-2 md:gap-16"
          >
            <motion.div variants={v}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-corisio-yellow">
                For store owners
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Be the store people find first.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-white/75">
                Corisio sends you customers who are already nearby and
                already looking for what you sell. You don&rsquo;t need a
                website. You don&rsquo;t need a delivery fleet. You need an
                accurate list of what you have.
              </p>
              <Link
                href="/for-businesses"
                className="mt-7 inline-flex h-11 items-center rounded-lg bg-corisio-yellow px-6 text-sm font-semibold text-black transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                List your store
              </Link>
            </motion.div>

            <motion.ul variants={v} className="flex flex-col gap-5 self-center">
              {[
                {
                  h: "Local customers, real intent",
                  p: "People searching on Corisio are looking for a specific item and are close enough to walk in.",
                },
                {
                  h: "Free during launch",
                  p: "Onboarding, listing, and product uploads are free while we grow city by city.",
                },
                {
                  h: "You control what\u2019s shown",
                  p: "Update stock, prices, and hours from your phone. What you mark is what users see.",
                },
              ].map((b) => (
                <li key={b.h} className="flex gap-4">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-corisio-yellow/25 text-corisio-yellow">
                    <CheckGlyph className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-white">
                      {b.h}
                    </p>
                    <p className="mt-1 text-[14px] leading-relaxed text-white/70">
                      {b.p}
                    </p>
                  </div>
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* FAQ                                                           */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-white">
        <div className={sectionContainer}>
          <div className="py-16 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Common questions
            </p>
            <h2 className="mt-3 max-w-[560px] text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
              Things people ask before their first search.
            </h2>

            <motion.dl
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              className="mt-10 divide-y divide-black/5 border-y border-black/5"
            >
              {FAQS.map((f) => (
                <motion.div key={f.q} variants={v} className="py-5 sm:py-6">
                  <dt className="text-[15px] font-semibold text-neutral-900 sm:text-base">
                    {f.q}
                  </dt>
                  <dd className="mt-2 max-w-[680px] text-[14px] leading-relaxed text-neutral-600 sm:text-[15px]">
                    {f.a}
                  </dd>
                </motion.div>
              ))}
            </motion.dl>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Final CTA                                                     */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-[#f5f8ef]">
        <div className={sectionContainer}>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="py-20 text-center sm:py-24"
          >
            <motion.h2
              variants={v}
              className="mx-auto max-w-[640px] text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl"
            >
              Try one search. See what&rsquo;s around you.
            </motion.h2>
            <motion.p
              variants={v}
              className="mx-auto mt-4 max-w-[480px] text-[15px] leading-relaxed text-neutral-600"
            >
              It takes ten seconds to find out whether Corisio is useful in
              your neighbourhood. That&rsquo;s the whole pitch.
            </motion.p>
            <motion.div
              variants={v}
              className="mt-8 flex flex-wrap justify-center gap-3"
            >
              <Link
                href="/search"
                className="inline-flex h-11 items-center rounded-lg bg-corisio-blue px-6 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
              >
                Find nearby stores
              </Link>
              <Link
                href="/for-businesses"
                className="inline-flex h-11 items-center rounded-lg border border-corisio-blue/20 bg-white px-6 text-sm font-medium text-corisio-blue transition hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
              >
                List your store
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Inline glyphs — no icon dependency                                  */
/* ------------------------------------------------------------------ */

type GlyphProps = { className?: string };

function SearchGlyph({ className = "h-5 w-5" }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function StoreGlyph({ className = "h-5 w-5" }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 9.5 5 4h14l2 5.5" />
      <path d="M3 9.5V20h18V9.5" />
      <path d="M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
      <path d="M9 20v-5h6v5" />
    </svg>
  );
}

function CompareGlyph({ className = "h-5 w-5" }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 7h13" />
      <path d="m14 4 3 3-3 3" />
      <path d="M20 17H7" />
      <path d="m10 14-3 3 3 3" />
    </svg>
  );
}

function RouteGlyph({ className = "h-5 w-5" }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="6" cy="19" r="2.5" />
      <circle cx="18" cy="5" r="2.5" />
      <path d="M8.5 19h6a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7h6" />
    </svg>
  );
}

function CheckGlyph({ className = "h-4 w-4" }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

function SparkGlyph({ className = "h-4 w-4" }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.5 13.6 8l5.4 1.6-5.4 1.6L12 16.7l-1.6-5.5L5 9.6l5.4-1.6L12 2.5Z" />
    </svg>
  );
}

function ArrowGlyph({ className = "h-4 w-4" }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}