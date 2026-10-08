import type { Metadata } from "next";
import { Suspense } from "react";
import type { ApiSuccess, PublicStoreDetail } from "@/redux/types";
import StoreClient from "./StoreClient";

type Params = Promise<{ slug: string }>;

/**
 * Server-side only for the page <title> / description. The store itself is fetched in
 * the browser by StoreClient (RTK Query), like every other storefront page, so it can
 * carry the visitor's location and show distances.
 */
async function fetchStoreMeta(slug: string): Promise<PublicStoreDetail | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return null;

  try {
    const res = await fetch(`${baseUrl}/catalog/stores/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const body: ApiSuccess<PublicStoreDetail> = await res.json();
    return body?.success ? body.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const store = await fetchStoreMeta((await params).slug);
  return store
    ? { title: store.name, description: store.tagline || store.description || undefined }
    : { title: "Store" };
}

export default async function StorePage({ params }: { params: Params }) {
  const { slug } = await params;
  return (
    <Suspense fallback={null}>
      <StoreClient slug={slug} />
    </Suspense>
  );
}
