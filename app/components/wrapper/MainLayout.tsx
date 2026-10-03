import type { ReactNode } from "react";
import Footer, { type FooterProps } from "./Footer";
import Header from "./Header";

type MainLayoutProps = FooterProps & {
  children: ReactNode;
  className?: string;
};

export default function MainLayout({
  children,
  className = "",
  showWhyShopWithUs,
  showNewsletter,
  newsletterAction,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:text-black"
      >
        Skip to content
      </a>

      <Header />

      <main id="main-content" className={`flex-1 mt-44 ${className}`}>
        {children}
      </main>

      <Footer
        showWhyShopWithUs={showWhyShopWithUs}
        showNewsletter={showNewsletter}
        newsletterAction={newsletterAction}
      />
    </div>
  );
}
