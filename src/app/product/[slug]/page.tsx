import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { Product } from '@/types';
import productsData from '@/data/products.json';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import RelatedProducts from '@/components/product/RelatedProducts';
import Icon from '@/components/ui/Icon';

const products = productsData as Product[];

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
  const product = products.find((p) => p.slug === slug);
  if (!product) return { title: 'Product Not Found' };

  return {
    title: product.name,
    description: product.description,
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
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-muted font-medium">
        <Link href="/" className="hover:text-maroon transition-colors">
          Home
        </Link>
        <Icon name="chevron-right" size={14} />
        <Link href="/shop" className="hover:text-maroon transition-colors">
          Shop
        </Link>
        <Icon name="chevron-right" size={14} />
        <span className="text-char truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left: Gallery (5 cols) */}
        <div className="lg:col-span-6 sticky top-24">
          <ProductGallery
            images={product.images}
            productName={product.name}
          />
        </div>

        {/* Right: Info & Actions (7 cols) */}
        <div className="lg:col-span-6">
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts
        currentSku={product.sku}
        allProducts={products}
      />
    </div>
  );
}
