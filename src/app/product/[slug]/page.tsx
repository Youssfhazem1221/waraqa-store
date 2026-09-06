import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Product } from '@/types';
import productsData from '@/data/products.json';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import RelatedProducts from '@/components/product/RelatedProducts';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import JsonLd from '@/components/seo/JsonLd';
import { productSchema, breadcrumbSchema } from '@/lib/schema';
import { getCatalog } from '@/lib/catalog';

const products = productsData as Product[];

/**
 * Re-generate a product page at most once every 5 minutes.
 *
 * This route used to read the catalog with `cache: 'no-store'`, which opted it
 * out of static generation entirely: every visit blocked on a fresh Apps Script
 * round-trip before a single byte was sent. With ISR the page is served from the
 * cache instantly and refreshed in the background, so stock and pricing stay
 * current without the shopper paying the backend's latency.
 */
export const revalidate = 300;

export function generateStaticParams() {
  return products.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCatalog();
  const product =
    catalog.find((p) => p.slug === slug) || products.find((p) => p.slug === slug);
  if (!product) return { title: 'Product Not Found' };

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.name} · Waraqa (ورقة)`,
      description: product.description,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Live catalog for real-time pricing and stock, bundled data as the floor.
  const liveProducts = await getCatalog();
  const product =
    liveProducts.find((p) => p.slug === slug) || products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const catalog = liveProducts.length > 0 ? liveProducts : products;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      <ProductBreadcrumb productName={product.name} productNameAr={product.nameAr} />

      {/* Main Product View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left: Gallery — sticky only on the desktop two-column layout;
            on mobile it must scroll normally, not pin to the top. */}
        <div className="lg:col-span-6 lg:sticky lg:top-24">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Right: Info & Actions */}
        <div className="lg:col-span-6">
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Related — from the live catalog, so a card here can't advertise a
          price or stock level the product page itself has already corrected. */}
      <RelatedProducts current={product} allProducts={catalog} />

      {/* Structured data: lets Google show price and availability directly in
          results, and is what AI answer engines read to cite the product. */}
      <JsonLd
        data={[
          productSchema(product, 'en'),
          breadcrumbSchema('en', [
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: product.name, path: `/product/${product.slug}` },
          ]),
        ]}
      />
    </div>
  );
}
