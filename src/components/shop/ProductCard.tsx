'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import Icon from '@/components/ui/Icon';
import { formatAmount } from '@/lib/money';
import { shortName } from '@/lib/api';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { t, isRTL, lp } = useLanguage();
  const [imageFailed, setImageFailed] = React.useState(false);
  const isOutOfStock = product.stock <= 0 || product.status === 'Out of stock';

  const displayName = isRTL ? (product.nameAr || product.name) : product.name;
  const specSummary = isRTL
    ? `${product.size} · ${product.sheets} ورقة · ${product.gsm} جرام`
    : `${product.size} · ${product.sheets} sheets · ${product.gsm}gsm`;
  const href = lp(`/product/${product.slug}`);

  return (
    <div className="group flex flex-col">
      {/* The photo sits directly on the page colour — product shots are shot on
          the same cream, so there is no card edge to draw. */}
      <Link href={href} className="relative block aspect-square w-full overflow-hidden bg-cream" aria-label={displayName}>
        {imageFailed ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted">
            <Icon name="box" size={28} />
            <span className="text-xs">{t.common.photoComingSoon}</span>
          </div>
        ) : (
          <Image
            src={product.image}
            alt={displayName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
            onError={() => setImageFailed(true)}
            className={`object-cover object-center transition-transform duration-500 group-hover:scale-[1.03] ${
              isOutOfStock ? 'opacity-50' : ''
            }`}
          />
        )}
        {(isOutOfStock || product.featured) && (
          <span className="absolute top-3 start-3 border border-char/15 text-char text-xs px-2 py-1">
            {isOutOfStock ? t.common.soldOut : t.common.popular}
          </span>
        )}
      </Link>

      <div className="pt-4 flex flex-col flex-1">
        <Link href={href} className="hover:text-maroon transition-colors">
          <h3 className="text-char leading-snug">{shortName(displayName)}</h3>
        </Link>
        <p className="mt-1 text-sm text-muted">{specSummary}</p>

        <div className="mt-3 pt-3 border-t border-line flex items-center justify-between gap-3">
          <span className="tabular-nums text-char">
            {formatAmount(product.price)} {t.common.currency}
            {product.compareAt > product.price && (
              <span className="ms-2 text-sm text-muted line-through">
                {formatAmount(product.compareAt)}
              </span>
            )}
          </span>
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => addItem(product, 1)}
            className="text-sm text-maroon underline underline-offset-4 decoration-1 hover:decoration-2 disabled:text-muted disabled:no-underline disabled:cursor-not-allowed cursor-pointer py-1"
          >
            {isOutOfStock ? t.common.soldOut : t.shop.addToBag}
          </button>
        </div>
      </div>
    </div>
  );
}
