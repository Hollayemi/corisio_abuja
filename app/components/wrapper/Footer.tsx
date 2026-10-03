import Image from "next/image";
import Link from "next/link";
import Newsletter, { type NewsletterAction } from "./Newsletter";
import WhyShopWithUs from "./WhyShopWithUs";
import { siteConfig } from "@/app/config/site";

export type FooterProps = {
  /** Show the "Why Shop With Us" strip above the footer. Default: true */
  showWhyShopWithUs?: boolean;
  /** Show the newsletter signup above the footer. Default: true */
  showNewsletter?: boolean;
  /** Server Action called with the email when the newsletter form is submitted. */
  newsletterAction?: NewsletterAction;
};

export default function Footer({
  showWhyShopWithUs = true,
  showNewsletter = true,
  newsletterAction,
}: FooterProps) {
  return (
    <>
      {showWhyShopWithUs && <WhyShopWithUs />}

      {/* The grey band runs behind the newsletter and the footer card */}
      <div className={showNewsletter ? "bg-[#f6f6f3]" : undefined}>
        {showNewsletter && <Newsletter action={newsletterAction} />}

        <footer className="px-4 pb-6 pt-4 sm:px-6">
          <div className="mx-auto w-full max-w-[1240px] rounded-[28px] bg-corisio-blue px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-14">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
              {/* Brand + address */}
              <div>
                <Link
                  href="/"
                  aria-label={`${siteConfig.name} home`}
                  className="inline-block"
                >
                  <Image
                    src={siteConfig.logo}
                    alt={siteConfig.name}
                    width={130}
                    height={52}
                    className="h-12 w-auto"
                  />
                </Link>

                <address className="mt-10 not-italic">
                  <p className="text-sm font-semibold">Address</p>
                  <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-white/70">
                    {siteConfig.address}
                  </p>
                </address>
              </div>

              {/* Link columns */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
                {siteConfig.footerColumns.map((col) => (
                  <nav key={col.title} aria-label={col.title}>
                    <h2 className="text-sm font-semibold">{col.title}</h2>
                    <ul className="mt-4 flex flex-col gap-2.5">
                      {col.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="text-xs text-white/70 transition hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:underline"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                ))}
              </div>
            </div>

            <p className="mt-16 text-sm text-white/90">
              Copyright &copy; {new Date().getFullYear()} {siteConfig.name}. All
              Rights Reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
