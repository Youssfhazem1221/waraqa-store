'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import Icon from '@/components/ui/Icon';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { t, isRTL } = useLanguage();
  const [imageFailed, setImageFailed] = React.useState(false);
  const isOutOfStock = product.stock <= 0 || product.status === 'Out of stock';

  const displayName = isRTL ? (product.nameAr || product.name) : product.name;
  const secondaryName = isRTL ? product.name : product.nameAr;

  return (
    <div className="group relative bg-white border border-line rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* Top Image Box (1:1 aspect ratio) */}
      <div className="relative aspect-square w-full bg-[#FAF5EE] overflow-hidden">
        {/* Best-seller badge — brand sage, brand type, no uppercase/mono */}
        {product.featured && !isOutOfStock && (
          <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} z-10 pointer-events-none`}>
            <span className="inline-flex items-center bg-sage text-esp text-[11px] sm:text-xs font-semibold px-2.5 py-1 shadow-sm">
              {t.common.popular}
            </span>
          </div>
        )}

        {/* Product Photo with Link */}
        <Link
          href={`/product/${product.slug}`}
          className="block w-full h-full relative"
          aria-label={`View ${displayName}`}
        >
          {imageFailed ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted bg-[#FAF5EE]">
              <Icon name="box" size={28} />
              <span className="text-xs font-medium">Photo coming soon</span>
            </div>
          ) : (
            <Image
              src={product.image}
              alt={displayName}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              onError={() => setImageFailed(true)}
              className={`object-cover object-center transition-transform duration-500 group-hover:scale-105 ${
                isOutOfStock ? 'opacity-60 grayscale-[30%]' : ''
              }`}
            />
          )}
        </Link>
      </div>

      {/* Product Details Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          {/* Size & Secondary Title */}
          <div className="flex items-center justify-between text-xs text-muted mb-1 font-medium">
            <span>{product.size}</span>
            <span className="text-[11px] opacity-75 truncate max-w-[140px]">{secondaryName}</span>
          </div>

          {/* Product Title */}
          <Link href={`/product/${product.slug}`} className="block group-hover:text-maroon transition-colors">
            <h3 className="font-semibold text-char text-base line-clamp-1">
              {displayName}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-serif font-bold text-maroon text-xl sm:text-2xl">
              {product.price} <span className="text-sm font-sans font-normal text-muted">{t.common.currency}</span>
            </span>
            {product.compareAt > product.price && (
              <span className="text-sm text-muted/70 line-through">
                {product.compareAt} {t.common.currency}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => addItem(product, 1)}
            className={`w-full inline-flex items-center justify-center gap-2 text-sm font-medium py-2.5 px-4 rounded-xl transition-all select-none ${
              isOutOfStock
                ? 'bg-line text-muted cursor-not-allowed border border-line'
                : 'bg-maroon text-cream hover:bg-esp active:scale-[0.98] shadow-xs'
            }`}
          >
            <Icon name="bag" size={18} />
            <span>{isOutOfStock ? t.common.soldOut : t.shop.addToBag}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
