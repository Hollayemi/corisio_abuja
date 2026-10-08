"use client";

import ProductSection from "./ProductSection";
import { useListStorefrontProductsQuery } from "@/redux/slices/catalogApi";

export default function BestSellers() {
  const { data, isLoading } = useListStorefrontProductsQuery({
    sort: "best-selling",
    perPage: 6,
  });

  return (
    <ProductSection
      id="best-sellers"
      title="🛒 Best Sellers"
      viewAllHref="/shop?sort=best-selling"
      viewAllLabel="View all best sellers →"
      products={data?.data.items ?? []}
      isLoading={isLoading}
    />
  );
}
