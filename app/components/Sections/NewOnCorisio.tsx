"use client";

import ProductSection from "./ProductSection";
import { useListStorefrontProductsQuery } from "@/redux/slices/catalogApi";

export default function NewOnCorisio() {
  const { data, isLoading } = useListStorefrontProductsQuery({
    sort: "newest",
    perPage: 6,
  });

  return (
    <ProductSection
      id="new-on-corisio"
      title="🆕 New on Corisio"
      viewAllHref="/shop?sort=newest"
      viewAllLabel="See what's new →"
      products={data?.data.items ?? []}
      isLoading={isLoading}
    />
  );
}
