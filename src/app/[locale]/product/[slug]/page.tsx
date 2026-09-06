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
import { LOCALES, isLocale, seoAlternates } from '@/lib/seo';

const products = productsData as Product[];

export const revalidate = 300;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    products.map((p) => ({ locale, slug: p.slug }))
  );
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
  if (!product) return { title: 'Product Not Found' };

  const name = l === 'ar' ? (product.nameAr || product.name) : product.name;
  const desc = l === 'ar' ? (product.descriptionAr || product.description) : product.description;

  return {
    title: name,
    description: desc,
    alternates: seoAlternates(l, `/product/${product.slug}`),
    openGraph: {
      title: `${name} · Waraqa (ورقة)`,
      description: desc,
      images: [{ url: product.image }],
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
  const product =
    liveProducts.find((p) => p.slug === slug) || products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const catalog = liveProducts.length > 0 ? liveProducts : products;
  const homeName = l === 'ar' ? 'الرئيسية' : 'Home';
  const shopName = l === 'ar' ? 'المتجر' : 'Shop';
  const productName = l === 'ar' ? (product.nameAr || product.name) : product.name;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      <ProductBreadcrumb productName={product.name} productNameAr={product.nameAr} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <div className="lg:col-span-6 lg:sticky lg:top-24">
          <ProductGallery images={product.images} productName={product.name} />
        </div>
        <div className="lg:col-span-6">
          <ProductInfo product={product} />
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
