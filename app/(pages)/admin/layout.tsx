import type { Metadata } from "next";
import type { ReactNode } from "react";

// Nothing under /admin should be indexed, and the invite link carries a token
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/**
 * Admin pages get no storefront header/footer (that lives in the (customer)
 * layout). Route groups:
 *   (auth)       sign in + invite pages, open to everyone
 *   (protected)  everything else, staff only (see its layout)
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
