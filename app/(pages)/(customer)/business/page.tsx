import type { Metadata } from "next";
import BusinessActions from "./BusinessActions";

export const metadata: Metadata = {
  title: "For business",
  description:
    "List your store on Corisio, get found by shoppers nearby, and manage orders, stock and promotions from one dashboard.",
};

const container = "mx-auto w-full max-w-[1100px] px-4 sm:px-6";

const benefits = [
  {
    title: "Be found by people nearby",
    body: "Shoppers search for what they need and see the stores around them. Your shop shows up when someone close by is looking.",
  },
  {
    title: "Customers arrive ready to buy",
    body: "They see your products, prices and opening hours first, so the people who walk in already know you have what they want.",
  },
  {
    title: "Run it from one place",
    body: "Orders, stock, customers and promotions all live in your dashboard. No spreadsheets, no scattered messages.",
  },
];

const steps = [
  {
    title: "Create your store account",
    body: "Choose “I own a store” when you sign up, then confirm your email. It takes about a minute.",
  },
  {
    title: "Set up your store profile",
    body: "Tell us your store name, email, phone, address and region, and optionally a short description. This is what shoppers see on your store page.",
  },
  {
    title: "Pin your exact location",
    body: "Add your latitude and longitude. Corisio uses this to show how far you are from each shopper, so an accurate pin means the right people find you.",
  },
  {
    title: "Add your products",
    body: "Open Inventory and list what you sell with clear names, prices and stock counts. Start with your best sellers; you can add the rest later.",
  },
  {
    title: "Go live and keep it fresh",
    body: "Once your products are up, you appear to nearby shoppers. Check Orders daily and keep stock up to date.",
  },
];

const dashboard = [
  { name: "Overview", body: "Your day at a glance: how the store is doing right now." },
  { name: "Store", body: "Edit your profile, details and how your shop looks to shoppers." },
  { name: "Orders", body: "See every customer order, track its status and follow it through." },
  { name: "Customers", body: "Know who buys from you and what they've ordered before." },
  { name: "Inventory", body: "Track stock levels and availability so you never sell what you don't have." },
  { name: "Promotions", body: "Create discounts and special offers to bring people in." },
  { name: "Delivery & Schedule", body: "Plan and manage deliveries on a calendar." },
  { name: "Analytics", body: "See how the business is performing over time." },
  { name: "Membership", body: "Manage plans and subscribers if you offer recurring orders." },
  { name: "Settings", body: "Manage your store, operations, notifications and account preferences." },
];

const tips = [
  "Keep your opening hours correct. Shoppers see whether you're open before they head out.",
  "Use names people actually search for, such as “USB-C charger”, not internal codes.",
  "Update stock as it changes. Nothing frustrates a customer more than a wasted trip.",
  "Add several products on day one. Stores with a fuller catalogue show up in more searches.",
  "Run a promotion now and then. Offers give new customers a reason to try you.",
  "Check orders every day and respond quickly. It builds trust with local shoppers.",
];

const faqs = [
  {
    q: "What do I need before I start?",
    a: "Your store's name, contact email and phone number, its address and region, and a list of the products you want to sell with their prices. A photo of your store helps too.",
  },
  {
    q: "Do I need technical skills?",
    a: "No. If you can use a phone or a web browser, you can run your store here. Everything is set up through simple forms.",
  },
  {
    q: "How do shoppers find me?",
    a: "They search for a product or browse a category, and Corisio shows stores near them on a map and in lists. The closer you are and the better your catalogue, the more you appear.",
  },
  {
    q: "Where do I sign in after setting up?",
    a: "Go to the dashboard at /dashboard and sign in with the same email and password you used to register.",
  },
  {
    q: "Can I change my details later?",
    a: "Yes. You can update your store profile, products and prices from the dashboard at any time.",
  },
];

export default function BusinessPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-corisio-blue py-16 text-white sm:py-24">
        <div className={container}>
          <p className="text-sm font-semibold uppercase tracking-wide text-corisio-yellow">
            Corisio for business
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">
            Be the store <span className="text-corisio-yellow">people nearby find first</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/80">
            Corisio puts your shop in front of people who are close by and looking for what you sell.
            This guide shows you how to get set up and make the most of it.
          </p>
          <div className="mt-8">
            <BusinessActions />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className={`${container} py-16 sm:py-20`} aria-labelledby="why">
        <h2 id="why" className="text-2xl font-bold text-neutral-800 sm:text-3xl">
          Why list your store on <span className="text-corisio-yellow">Corisio</span>
        </h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-3">
          {benefits.map((b) => (
            <li key={b.title} className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h3 className="text-base font-semibold text-neutral-800">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">{b.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Getting started */}
      <section className="bg-[#f5f8ef] py-16 sm:py-20" aria-labelledby="start">
        <div className={container}>
          <h2 id="start" className="text-2xl font-bold text-neutral-800 sm:text-3xl">
            Get started in <span className="text-corisio-yellow">five steps</span>
          </h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-2">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-4 rounded-2xl bg-white p-6 shadow-sm">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-corisio-blue text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-neutral-800">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Dashboard tour */}
      <section className={`${container} py-16 sm:py-20`} aria-labelledby="dashboard">
        <h2 id="dashboard" className="text-2xl font-bold text-neutral-800 sm:text-3xl">
          Your dashboard, <span className="text-corisio-yellow">section by section</span>
        </h2>
        <p className="mt-3 max-w-xl text-sm text-neutral-500">
          After you sign in you&apos;ll see a menu down the side. Here&apos;s what each part is for.
        </p>
        <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dashboard.map((d) => (
            <div key={d.name} className="rounded-xl border border-neutral-200 bg-white p-5">
              <dt className="text-sm font-semibold text-corisio-blue">{d.name}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-neutral-500">{d.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Tips */}
      <section className="bg-[#f5f8ef] py-16 sm:py-20" aria-labelledby="tips">
        <div className={container}>
          <h2 id="tips" className="text-2xl font-bold text-neutral-800 sm:text-3xl">
            Tips to <span className="text-corisio-yellow">get more customers</span>
          </h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {tips.map((t) => (
              <li key={t} className="flex gap-3 rounded-xl bg-white p-5 text-sm leading-relaxed text-neutral-600 shadow-sm">
                <span aria-hidden className="mt-0.5 text-corisio-blue">✓</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className={`${container} max-w-[800px] py-16 sm:py-20`} aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-bold text-neutral-800 sm:text-3xl">
          Common questions
        </h2>
        <div className="mt-8 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
          {faqs.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-neutral-800 focus-visible:outline-2 focus-visible:outline-corisio-blue">
                {f.q}
                <span aria-hidden className="text-lg text-corisio-blue transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className={`${container} pb-16 sm:pb-20`}>
        <div className="rounded-2xl bg-corisio-blue px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to put your store on the map?</h2>
          <p className="mx-auto mt-3 max-w-[460px] text-sm text-white/80">
            Set up takes a few minutes. Your first customers could be right around the corner.
          </p>
          <div className="mt-8 flex justify-center">
            <BusinessActions />
          </div>
        </div>
      </section>
    </div>
  );
}
