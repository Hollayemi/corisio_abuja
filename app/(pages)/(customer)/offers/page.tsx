import type { Metadata } from "next";
import { Suspense } from "react";
import OffersClient from "./OffersClient";

export const metadata: Metadata = {
  title: "Offers | Corisio",
  description: "Products on promotion at stores near you. Browse discounts and special offers.",
};

export default function OffersPage() {
  return (
    <Suspense fallback={null}>
      <OffersClient />
    </Suspense>
  );
}
