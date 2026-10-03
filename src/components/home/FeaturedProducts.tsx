'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import type { Product } from '@/types';
import ProductCard from '@/components/shop/ProductCard';
import { useLanguage } from '@/context/LanguageContext';

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const { t, lp } = useLanguage();

  // Show the featured products first, topped up with the rest of the catalog to
  // fill the four-card row. The previous version threw the featured list away
  // entirely unless it held four or more, so a shop with two best-sellers
  // showed neither of them here.
  const displayList = useMemo(() => {
    const inStock = (p: Product) => p.stock > 0 && p.status === 'Active';
    const rank = (p: Product) => (p.featured ? 0 : 1) + (inStock(p) ? 0 : 2);
    return [...products].sort((a, b) => rank(a) - rank(b) || a.price - b.price).slice(0, 4);
  }, [products]);

  return (
    <section aria-labelledby="featured-title" className="border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex items-baseline justify-between gap-4 mb-8">
          <h2 id="featured-title" className="font-serif text-3xl sm:text-4xl font-semibold text-char">
            {t.featured.title}
          </h2>
          <Link
            href={lp('/shop')}
            className="text-sm text-maroon underline underline-offset-4 decoration-1 hover:decoration-2 shrink-0"
          >
            {t.featured.viewAll}
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-12">
          {displayList.map((product) => (
            <ProductCard key={product.sku} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
