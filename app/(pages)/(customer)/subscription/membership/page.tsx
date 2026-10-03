import type { Metadata } from "next";
import Link from "next/link";
import ManageClient from "./ManageClient";

export const metadata: Metadata = {
  title: "Manage Subscription | Luxol Supermarket",
};

const container = "mx-auto w-full max-w-[1240px] px-4 sm:px-6";

export default function MembershipPage() {
  return (
    <div>
      <section className="bg-[#f2f2f0] py-10 text-center sm:py-12">
        <div className={container}>
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Membership Subscription</h1>
          <nav aria-label="Breadcrumb" className="mt-3 text-sm">
            <ol className="flex items-center justify-center gap-x-2 text-neutral-600">
              <li>
                <Link href="/" className="hover:text-corisio-blue">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-medium text-corisio-blue">
                Manage Subscription
              </li>
            </ol>
          </nav>
        </div>
      </section>

      <div className={`${container} py-10 sm:py-14`}>
        <ManageClient />
      </div>
    </div>
  );
}