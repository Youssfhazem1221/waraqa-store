'use client';

import React, { useMemo } from 'react';
import type { Product } from '@/types';
import ProductCard from '@/components/shop/ProductCard';
import { useLanguage } from '@/context/LanguageContext';

interface RelatedProductsProps {
  current: Product;
  allProducts: Product[];
}

/**
 * Pick up to four products to show under the one being viewed.
 *
 * This used to take the first four of whatever order the catalog happened to be
 * in, which meant a sold-out book could headline the row while a closely
 * related one never appeared. Rank by how related each candidate actually is,
 * and push out-of-stock items to the back.
 */
function pickRelated(current: Product, all: Product[]): Product[] {
  return all
    .filter((p) => p.sku !== current.sku)
    .map((p) => {
      let score = 0;
      if (p.category === current.category) score += 3;
      if (p.size === current.size) score += 2;
      if (p.paperType === current.paperType) score += 2;
      // Same shelf of the price ladder — within ~40%.
      if (current.price > 0 && Math.abs(p.price - current.price) / current.price <= 0.4) {
        score += 1;
      }
      if (p.featured) score += 1;

      const inStock = p.stock > 0 && p.status === 'Active';
      return { product: p, score, inStock };
    })
    .sort((a, b) => {
      // Buyable first, then most-related, then cheapest for a stable order.
      if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
      if (b.score !== a.score) return b.score - a.score;
      return a.product.price - b.product.price;
    })
    .slice(0, 4)
    .map((entry) => entry.product);
}

export default function RelatedProducts({ current, allProducts }: RelatedProductsProps) {
  const { t } = useLanguage();
  const related = useMemo(() => pickRelated(current, allProducts), [current, allProducts]);

  if (related.length === 0) return null;

  return (
    <section className="pt-16 sm:pt-24 mt-16 border-t border-line">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-maroon">
            {t.product.relatedBadge}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-char mt-1">
            {t.product.relatedTitle}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {related.map((product) => (
          <ProductCard key={product.sku} product={product} />
        ))}
      </div>
    </section>
  );
}
