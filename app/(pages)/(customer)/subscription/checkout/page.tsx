import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";
import ConfirmationClient from "./ConfirmationClient";

export const metadata: Metadata = {
  title: "Membership Subscription | Luxol Supermarket",
};

const container = "mx-auto w-full max-w-[1240px] px-4 sm:px-6";

type SearchParams = Promise<{ plan?: string | string[]; subscription?: string | string[] }>;

function first(v?: string | string[]) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function SubscriptionCheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const planSlug = first(sp.plan);
  // The payment provider returns the customer here with ?subscription=<id>
  const subscriptionId = first(sp.subscription);

  // No plan chosen: send them to pick one. Whether the plan exists (and is
  // still on sale) is checked against the API by CheckoutClient.
  if (!planSlug && !subscriptionId) redirect("/subscription");

  return (
    <div>
      <section className="bg-[#f2f2f0] py-10 text-center sm:py-12">
        <div className={container}>
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            Membership Subscription
          </h1>
          <nav aria-label="Breadcrumb" className="mt-3 text-sm">
            <ol className="flex items-center justify-center gap-x-2 text-neutral-600">
              <li>
                <Link href="/" className="hover:text-corisio-blue">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-medium text-corisio-blue">
                Subscribe
              </li>
            </ol>
          </nav>
        </div>
      </section>

      <div className={`${container} py-10 sm:py-14`}>
        {subscriptionId ? (
          <ConfirmationClient subscriptionId={subscriptionId} />
        ) : (
          <CheckoutClient planSlug={planSlug!} />
        )}
      </div>
    </div>
  );
}