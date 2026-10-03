import type { Metadata } from "next";
import Link from "next/link";
import type { AccountTab } from "@/app/data/account-data";
import AccountClient from "./AccountClient";

export const metadata: Metadata = {
  title: "Account & Settings | Luxol Supermarket",
};

const container = "mx-auto w-full max-w-[1240px] px-4 sm:px-6";

type SearchParams = Promise<{ tab?: string | string[] }>;

function first(v?: string | string[]) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const tabParam = first(sp.tab);
  const initialTab: AccountTab =
    tabParam === "address" ? "address" : tabParam === "support" ? "support" : "personal";

  return (
    <div>
      <section className="bg-[#f2f2f0] py-10 sm:py-12">
        <div className={container}>
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            Account & Settings
          </h1>
          <nav aria-label="Breadcrumb" className="mt-3 text-sm">
            <ol className="flex items-center gap-x-2 text-neutral-600">
              <li>
                <Link href="/" className="hover:text-corisio-blue">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-medium text-corisio-blue">
                My Account
              </li>
            </ol>
          </nav>
        </div>
      </section>

      <div className={`${container} py-10 sm:py-14`}>
        <AccountClient initialTab={initialTab} />
      </div>
    </div>
  );
}
