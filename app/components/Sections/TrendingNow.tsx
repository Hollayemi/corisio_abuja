"use client";

import ProductSection from "./ProductSection";
import { useListStorefrontProductsQuery } from "@/redux/slices/catalogApi";

export default function TrendingNow() {
  const { data, isLoading } = useListStorefrontProductsQuery({
    sort: "trending",
    perPage: 6,
  });

  return (
    <ProductSection
      id="trending-now"
      title="📈 Trending Now"
      viewAllHref="/shop?sort=trending"
      viewAllLabel="View all trending →"
      products={data?.data.items ?? []}
      isLoading={isLoading}
    />
  );
}
