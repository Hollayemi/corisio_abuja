"use client";

import ProductSection from "./ProductSection";
import { useListStorefrontProductsQuery } from "@/redux/slices/catalogApi";

export default function ShopMore() {
  const { data, isLoading } = useListStorefrontProductsQuery({
    tag: "shop-more",
    perPage: 12,
  });

  return (
    <div className="bg-[#f6f6f3] pt-12 sm:pt-14">
      <ProductSection
        id="shop-more"
        title="Shop More"
        viewAllHref="/shop"
        viewAllLabel="View all products →"
        products={data?.data.items ?? []}
        isLoading={isLoading}
      />
    </div>
  );
}