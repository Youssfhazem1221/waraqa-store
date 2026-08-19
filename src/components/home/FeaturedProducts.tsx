'use client';

import React from 'react';
import Link from 'next/link';
import type { Product } from '@/types';
import ProductCard from '@/components/shop/ProductCard';
import Icon from '@/components/ui/Icon';
import { useLanguage } from '@/context/LanguageContext';

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const { t, isRTL } = useLanguage();

  const featured = products
    .filter((p) => p.featured)
    .slice(0, 4);

  const displayList = featured.length >= 4 ? featured : products.slice(0, 4);

  return (
    <section className="py-16 sm:py-24 border-b border-line bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-maroon">
              {t.featured.badge}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-char mt-1">
              {t.featured.title}
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-maroon hover:text-esp transition-colors group"
          >
            <span>{t.featured.viewAll}</span>
            <Icon
              name={isRTL ? 'chevron-left' : 'arrow-right'}
              size={18}
              className={`transition-transform ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}
            />
          </Link>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayList.map((product) => (
            <ProductCard key={product.sku} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
