import React from 'react';
import type { Product } from '@/types';
import ProductCard from '@/components/shop/ProductCard';

interface RelatedProductsProps {
  currentSku: string;
  allProducts: Product[];
}

export default function RelatedProducts({ currentSku, allProducts }: RelatedProductsProps) {
  const related = allProducts
    .filter((p) => p.sku !== currentSku)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="pt-16 sm:pt-24 mt-16 border-t border-line">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-maroon">
            More from Waraqa
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-char mt-1">
            You may also like
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
