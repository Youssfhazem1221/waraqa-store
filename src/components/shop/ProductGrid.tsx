import React from 'react';
import type { Product } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
      {products.map((product, idx) => (
        <ProductCard key={product.sku} product={product} priority={idx < 4} />
      ))}
    </div>
  );
}
