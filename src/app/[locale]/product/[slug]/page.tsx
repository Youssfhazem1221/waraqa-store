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
import { isLocale, seoAlternates, absoluteUrl, ogDefaults, metaDescription } from '@/lib/seo';
import { translations } from '@/lib/translations';

const products = productsData as Product[];
const OG_SLUGS = new Set(products.map((p) => p.slug));

// Rendered per request so prices are never older than the catalog cache
// (lib/catalog.ts). ISR left the deploy-time prices up on Cloudflare.
export const dynamic = 'force-dynamic';

/**
 * What a sold-out page offers instead: an in-stock book on the same paper
 * (same weight and type) if there is one, otherwise the nearest weight.
 */
function inStockAlternative(product: Product, catalog: Product[]): Product | undefined {
  return catalog
    .filter((p) => p.slug !== product.slug && p.status === 'Active' && p.stock > 0)
    .sort(
      (a, b) =>
        Math.abs(a.gsm - product.gsm) - Math.abs(b.gsm - product.gsm) ||
        Number(b.paperType === product.paperType) - Number(a.paperType === product.paperType) ||
        a.price - b.price
    )[0];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const l = isLocale(locale) ? locale : 'en';
  const catalog = await getCatalog();
  const product =
    catalog.find((p) => p.slug === slug) || products.find((p) => p.slug === slug);
  if (!product) return { title: translations[l].notFound.eyebrow };

  const name = l === 'ar' ? (product.nameAr || product.name) : product.name;
  const desc = l === 'ar' ? (product.descriptionAr || product.description) : product.description;

  const description = metaDescription(desc);

  return {
    title: name,
    description,
    alternates: seoAlternates(l, `/product/${product.slug}`),
    openGraph: {
      ...ogDefaults(l),
      title: `${name} · Waraqa (ورقة)`,
      description,
      url: absoluteUrl(l, `/product/${product.slug}`),
      // 1200×630 cards (public/og/) for the bundled catalog: the 1600×2000
      // studio shots are ~300–360 kB, past WhatsApp's preview limit, and
      // portrait, so share cards cropped the book. A product added later in the
      // Sheet falls back to its photo.
      images: [
        OG_SLUGS.has(product.slug)
          ? { url: `/og/product-${product.slug}.jpg`, width: 1200, height: 630, alt: name }
          : { url: product.image, alt: name },
      ],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const l = isLocale(locale) ? locale : 'en';

  const liveProducts = await getCatalog();
  const bundled = products.find((p) => p.slug === slug);
  // A book hidden or deleted in the Sheet is missing from the live catalog,
  // but the bundled snapshot still lists it in stock, so its page kept an
  // active "Add to bag" that checkout then refused. Keep the page for anyone
  // holding the link; just never offer it for sale.
  const product: Product | undefined =
    liveProducts.find((p) => p.slug === slug) ??
    (bundled && { ...bundled, stock: 0, status: 'Out of stock' });

  if (!product) {
    notFound();
  }

  const catalog = liveProducts.length > 0 ? liveProducts : products;
  const soldOut = product.stock <= 0 || product.status === 'Out of stock';
  const alternative = soldOut ? inStockAlternative(product, catalog) : undefined;
  const homeName = l === 'ar' ? 'الرئيسية' : 'Home';
  const shopName = l === 'ar' ? 'المتجر' : 'Shop';
  const productName = l === 'ar' ? (product.nameAr || product.name) : product.name;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <ProductBreadcrumb productName={product.name} productNameAr={product.nameAr} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <div className="lg:col-span-6 lg:sticky lg:top-24">
          <ProductGallery images={product.images} productName={productName} />
        </div>
        <div className="lg:col-span-6">
          <ProductInfo product={product} alternative={alternative} />
        </div>
      </div>

      <RelatedProducts current={product} allProducts={catalog} />

      <JsonLd
        data={[
          productSchema(product, l),
          breadcrumbSchema(l, [
            { name: homeName, path: '/' },
            { name: shopName, path: '/shop' },
            { name: productName, path: `/product/${product.slug}` },
          ]),
        ]}
      />
    </div>
  );
}
