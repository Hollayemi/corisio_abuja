import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How it works",
  description: "Corisio helps you find essential products at stores near you — search, compare, and go.",
};

const container = "mx-auto w-full max-w-[1100px] px-4 sm:px-6";

const shopperSteps = [
  { title: "Search for what you need", body: "Type a product, like “USB-C charger”, or browse a category. You don't need to know which store sells it." },
  { title: "See stores near you", body: "Corisio shows nearby stores on a map with distance, opening hours and prices, so you can compare at a glance." },
  { title: "Preview the store", body: "Tap a store on the map for a quick briefing: what it sells, how far it is, and whether it's open right now." },
  { title: "Go there", body: "Open the store page for the full catalogue, then get directions and walk in. No waiting for shipping." },
];

const storeSteps = [
  { title: "List your store", body: "Add your location, hours and the products you sell. We can help you get your catalogue online." },
  { title: "Get found by people nearby", body: "Shoppers searching for what you stock see you on the map, right when they're looking." },
  { title: "Welcome walk-in customers", body: "Customers arrive knowing you have the item and the price. More footfall, fewer wasted trips." },
];

function Steps({ items }: { items: { title: string; body: string }[] }) {
  return (
    <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s, i) => (
        <li key={s.title} className="rounded-2xl border border-neutral-200 bg-white p-6">
          <span className="flex size-10 items-center justify-center rounded-full bg-corisio-yellow text-sm font-bold text-corisio-blue">{i + 1}</span>
          <h3 className="mt-4 text-base font-semibold text-neutral-800">{s.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

export default function HowItWorksPage() {
  return (
    <div>
      <section className="bg-corisio-blue py-16 text-white sm:py-24">
        <div className={container}>
          <p className="text-sm font-semibold uppercase tracking-wide text-corisio-yellow">How Corisio works</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">
            “I need something.” <span className="text-corisio-yellow">Where is it near me?</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/80">
            Corisio is a discovery platform for local commerce. We connect people to nearby physical stores, quickly and easily, so everyday essentials are never far away.
          </p>
          <Link href="/stores" className="mt-8 inline-block rounded-lg bg-corisio-yellow px-6 py-3 text-sm font-semibold text-corisio-blue transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            Explore stores on the map
          </Link>
        </div>
      </section>

      <section className={`${container} py-16 sm:py-20`} aria-labelledby="shoppers">
        <h2 id="shoppers" className="text-2xl font-bold text-neutral-800 sm:text-3xl">For shoppers: <span className="text-corisio-yellow">four simple steps</span></h2>
        <Steps items={shopperSteps} />
      </section>

      <section className="bg-[#f5f8ef] py-16 sm:py-20" aria-labelledby="stores">
        <div className={container}>
          <h2 id="stores" className="text-2xl font-bold text-neutral-800 sm:text-3xl">For stores: <span className="text-corisio-yellow">be the one people find</span></h2>
          <p className="mt-3 max-w-xl text-sm text-neutral-500">Corisio isn&apos;t another giant marketplace asking you to compete nationwide. It puts your shop in front of people who are nearby and looking for what you sell.</p>
          <div className="mt-8"><ol className="grid gap-6 sm:grid-cols-3">
            {storeSteps.map((s, i) => (
              <li key={s.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <span className="flex size-10 items-center justify-center rounded-full bg-corisio-blue text-sm font-bold text-white">{i + 1}</span>
                <h3 className="mt-4 text-base font-semibold text-neutral-800">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">{s.body}</p>
              </li>
            ))}
          </ol></div>
          <Link href="/business" className="mt-8 inline-block text-sm font-semibold text-corisio-blue hover:underline">List your store →</Link>
        </div>
      </section>
    </div>
  );
}
