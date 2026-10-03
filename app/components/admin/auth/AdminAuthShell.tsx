import Image from "next/image";
import type { ReactNode } from "react";
import { siteConfig } from "@/app/config/site";

/**
 * The two-column frame shared by the admin sign in and invite pages:
 * logo top left, intro text on the left, the form card on the right
 * (stacked on small screens).
 */
export default function AdminAuthShell({
  pill,
  title,
  description,
  children,
}: {
  /** The small green tag above the title, e.g. "Sign in to Luxol" */
  pill: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f4f7fb] px-6 pb-12 pt-8 sm:px-12 lg:px-28 lg:pt-14">
      <header>
        <Image
          src={siteConfig.logo}
          alt={siteConfig.name}
          width={160}
          height={122}
          priority
          className="h-14 w-auto"
        />
      </header>

      <main className="mx-auto mt-10 grid w-full max-w-6xl flex-1 content-center items-center gap-10 lg:mt-0 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-24">
        <section>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcefd6] px-3 py-1.5 text-xs font-medium text-corisio-blue">
            <span aria-hidden="true" className="size-1 rounded-full bg-current" />
            {pill}
          </span>

          <h1 className="mt-6 max-w-[300px] text-4xl font-extrabold leading-[1.15] tracking-tight text-neutral-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-[340px] text-sm leading-relaxed text-neutral-500">
            {description}
          </p>
        </section>

        <div className="w-full max-w-[440px] rounded-2xl border border-neutral-100 bg-white p-7 lg:justify-self-start">
          {children}
        </div>
      </main>
    </div>
  );
}
