"use client";

import ProductSection from "./ProductSection";
import { useListStorefrontProductsQuery } from "@/redux/slices/catalogApi";

export default function FreshProducts() {
  const { data, isLoading } = useListStorefrontProductsQuery({
    tag: "fresh-products",
    perPage: 6,
  });

  return (
    <ProductSection
      id="fresh-products"
      title="Fresh Products"
      viewAllHref="/shop?category=vegetables-produce"
      viewAllLabel="View all products →"
      products={data?.data.items ?? []}
      isLoading={isLoading}
    />
  );
}