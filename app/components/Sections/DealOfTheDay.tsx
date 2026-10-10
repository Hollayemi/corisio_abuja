"use client";

import ProductSection from "./ProductSection";
import { useListStorefrontProductsQuery } from "@/redux/slices/catalogApi";

export default function DealOfTheDay() {
  const { data, isLoading } = useListStorefrontProductsQuery({
    tag: "deal-of-the-day",
    perPage: 6,
  });

  return (
    <ProductSection
      id="deal-of-the-day"
      title="Deals of the Day"
      viewAllHref="/offers"
      viewAllLabel="View all deals →"
      products={data?.data.items ?? []}
      isLoading={isLoading}
      emptyMessage="No deals right now — check back soon."
    />
  );
}