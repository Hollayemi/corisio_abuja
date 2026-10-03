import Link from "next/link";
import { MailIcon, WhatsAppIcon } from "@/app/components/ui/icons";
import { siteConfig } from "@/app/config/site";

const CARD =
  "flex items-start gap-4 rounded-2xl border border-neutral-200 p-5 transition hover:border-corisio-blue";

const FAQS = [
  {
    q: "Where is my order?",
    a: "Track any order's status and delivery timeline from My Orders.",
    href: "/orders",
  },
  {
    q: "How do subscriptions work?",
    a: "See plans, pricing and how to pause, skip or cancel a delivery.",
    href: "/subscription",
  },
  {
    q: "What's your returns policy?",
    a: "Most items can be returned within 7 days of delivery.",
    href: "/orders",
  },
];

export default function SupportHelpPanel() {
  return (
    <div>
      <h2 className="text-lg font-bold text-neutral-900">Support & Help</h2>
      <p className="mt-2 max-w-[520px] text-sm text-neutral-500">
        Have a question about an order, a delivery or your account? Reach us
        directly, or check the quick answers below.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <a href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`} className={CARD}>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-corisio-blue/10 text-corisio-blue">
            <WhatsAppIcon className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-neutral-900">
              Call or WhatsApp us
            </span>
            <span className="mt-1 block text-sm text-neutral-500">
              {siteConfig.phone}
            </span>
          </span>
        </a>

        <a href="mailto:hello@luxol.com" className={CARD}>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-corisio-blue/10 text-corisio-blue">
            <MailIcon className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-neutral-900">
              Email support
            </span>
            <span className="mt-1 block text-sm text-neutral-500">
              hello@luxol.com
            </span>
          </span>
        </a>
      </div>

      <h3 className="mt-10 text-sm font-semibold uppercase tracking-wide text-neutral-400">
        Frequently asked
      </h3>
      <div className="mt-4 divide-y divide-neutral-100 rounded-2xl border border-neutral-200">
        {FAQS.map((f) => (
          <Link
            key={f.q}
            href={f.href}
            className="flex items-center justify-between gap-4 p-5 transition hover:bg-neutral-50"
          >
            <span>
              <span className="block text-sm font-semibold text-neutral-900">{f.q}</span>
              <span className="mt-1 block text-sm text-neutral-500">{f.a}</span>
            </span>
            <span aria-hidden="true" className="shrink-0 text-corisio-blue">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
