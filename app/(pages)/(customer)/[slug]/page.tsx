import type { Metadata } from "next";
import { Suspense } from "react";
import ProductClient from "./ProductClient";
import type { ApiSuccess, StorefrontProduct } from "@/redux/types";

type Params = Promise<{ slug: string }>;

async function fetchProductMeta(slug: string): Promise<StorefrontProduct | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return null;

  try {
    const res = await fetch(`${baseUrl}/catalog/products/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const body: ApiSuccess<StorefrontProduct> = await res.json();
    return body?.success ? body.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductMeta(slug);

  if (!product) return { title: "Product not found | Luxol Supermarket" };

  return {
    title: `${product.name} | Luxol Supermarket`,
    description: product.shortDescription || product.description || undefined,
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;

  return (
    <Suspense fallback={null}>
      <ProductClient slug={slug} />
    </Suspense>
  );
}
