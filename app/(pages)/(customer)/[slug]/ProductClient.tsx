"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { DeliveryIcon } from "@/app/components/ui/icons";
import ProductCard from "@/app/components/ui/ProductCard";
import ProductGallery from "@/app/components/ui/ProductGallery";
import ProductPurchase from "@/app/components/ui/ProductPurchase";
import { formatNaira, getDisplayPrice } from "@/app/utils/product";
import {
  useGetRelatedProductsQuery,
  useGetStorefrontProductQuery,
} from "@/redux/slices/catalogApi";

const container = "mx-auto w-full max-w-[1240px] px-4 sm:px-6";

function ProductSkeleton() {
  return (
    <div className={`${container} animate-pulse py-12 sm:py-16`}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,490px)_minmax(0,1fr)] lg:gap-14">
        <div className="aspect-square rounded-[36px] bg-neutral-100" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded bg-neutral-100" />
          <div className="h-4 w-full rounded bg-neutral-100" />
          <div className="h-4 w-2/3 rounded bg-neutral-100" />
          <div className="h-10 w-40 rounded bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}

export default function ProductClient({ slug }: { slug: string }) {
  const { data, isLoading, isFetching, isError, error } = useGetStorefrontProductQuery(slug);
  const { data: relatedData } = useGetRelatedProductsQuery(
    { slug, limit: 10 },
    { skip: !data },
  );

  const product = data?.data;
  const related = (relatedData?.data.items ?? []).filter((p) => p.slug !== slug);

  if (isLoading && !product) return <ProductSkeleton />;

  if (isError) {
    // A real 404 from the API shows Next's not-found page; anything else
    // (network blip, 500) gets a friendlier inline message with a retry.
    if ((error as { status?: number } | undefined)?.status === 404) notFound();
    return (
      <div className={`${container} py-24 text-center`}>
        <p className="text-lg font-medium text-neutral-800">
          We couldn&rsquo;t load this product right now.
        </p>
        <p className="mt-2 text-sm text-neutral-500">Please refresh the page to try again.</p>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images.length > 0 ? product.images : ["/products/placeholder.webp"];
  const { price, wasPrice, discountPercent } = getDisplayPrice(product);
  const description = product.description || product.shortDescription;

  return (
    <div className={isFetching ? "opacity-60 transition-opacity" : ""}>
      {/* Page banner */}
      <section className="bg-[#f2f2f0] py-12 text-center sm:py-16">
        <div className={container}>
          <p className="text-3xl font-bold text-neutral-900 sm:text-4xl">Shop</p>
          <nav aria-label="Breadcrumb" className="mt-3 text-sm">
            <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-neutral-900">
              <li>
                <Link href="/" className="hover:text-corisio-blue">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/shop" className="hover:text-corisio-blue">
                  Shop
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={`/shop?category=${product.category.slug}`}
                  className="hover:text-corisio-blue"
                >
                  {product.category.name}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="max-w-[220px] truncate font-medium text-corisio-blue sm:max-w-none">
                {product.name}
              </li>
            </ol>
          </nav>
        </div>
      </section>

      <div className={`${container} py-12 sm:py-16`}>
        {/* Gallery + purchase panel */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,490px)_minmax(0,1fr)] lg:gap-14">
          <ProductGallery images={images} name={product.name} />

          <div className="min-w-0">
            <h1 className="break-words text-2xl font-semibold text-neutral-700 sm:text-[28px]">
              {product.name}
            </h1>

            {description && (
              <p className="mt-3 max-w-[640px] text-base leading-relaxed text-neutral-500">
                {description}
              </p>
            )}

            <p className="mt-5 flex flex-wrap items-baseline gap-x-3">
              <span className="break-words text-4xl font-bold text-neutral-900">
                {formatNaira(price)}
              </span>
              {wasPrice ? (
                <del className="text-base text-neutral-400">{formatNaira(wasPrice)}</del>
              ) : null}
              {discountPercent ? (
                <span className="rounded-full bg-corisio-blue/10 px-2.5 py-1 text-xs font-semibold text-corisio-blue">
                  {discountPercent}% OFF
                </span>
              ) : null}
            </p>

            <p className="mt-5 inline-flex items-center gap-2.5 rounded-lg bg-[#eaf3e6] px-4 py-3 text-sm text-corisio-blue">
              <DeliveryIcon className="size-4 shrink-0" />
              30 minutes to 2 Hours delivery depending on location
            </p>

            <div className="mt-8">
              <ProductPurchase product={product} variants={product.variants} />
            </div>
          </div>
        </div>

        {/* About */}
        {(product.shortDescription || product.sku || product.weight) && (
          <section
            aria-labelledby="about-heading"
            className="mt-16 max-w-[720px] sm:mt-20"
          >
            <h2 id="about-heading" className="text-2xl font-semibold text-neutral-700">
              About this product
            </h2>

            {product.shortDescription && (
              <p className="mt-4 text-base leading-relaxed text-neutral-500">
                {product.shortDescription}
              </p>
            )}

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:max-w-md">
              <div>
                <dt className="text-neutral-400">SKU</dt>
                <dd className="text-neutral-700">{product.sku}</dd>
              </div>
              <div>
                <dt className="text-neutral-400">Unit</dt>
                <dd className="text-neutral-700">{product.unitType}</dd>
              </div>
              {product.weight ? (
                <div>
                  <dt className="text-neutral-400">Weight</dt>
                  <dd className="text-neutral-700">{product.weight}kg</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-neutral-400">Availability</dt>
                <dd className={product.stock > 0 ? "text-corisio-blue" : "text-red-500"}>
                  {product.stock > 0 ? "In stock" : "Out of stock"}
                </dd>
              </div>
            </dl>
          </section>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-20 sm:mt-28">
            <div className="text-center">
              <p className="text-lg font-semibold text-neutral-500">Related Products</p>
              <h2
                id="related-heading"
                className="mt-2 text-3xl font-bold text-neutral-800 sm:text-4xl"
              >
                Explore <span className="text-corisio-blue">Related Products</span>
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-5">
              {related.slice(0, 5).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
