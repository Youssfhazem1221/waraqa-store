'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import Icon from '@/components/ui/Icon';
import Price from '@/components/ui/Price';
import SpecLine from '@/components/ui/SpecLine';
import HeadingText from '@/components/ui/HeadingText';
import { formatNumber, formatPriceAmount, paperTypeLabel, sizeLabel } from '@/lib/format';
import { shortName } from '@/lib/api';
import { mediumFor } from '@/lib/paper';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { t, isRTL, lp, locale } = useLanguage();
  const [imageFailed, setImageFailed] = useState(false);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    },
    []
  );

  const isOutOfStock = product.stock <= 0 || product.status === 'Out of stock';
  const isLowStock = !isOutOfStock && product.stock <= 5;
  const displayName = shortName(isRTL ? product.nameAr || product.name : product.name);
  const href = lp(`/product/${product.slug}`);
  const goodFor = t.guide[`${mediumFor(product.gsm)}Title`];
  const weight = isRTL ? `${formatNumber(product.gsm, locale)} جرام` : `${product.gsm}gsm`;
  const sheetsLine = isRTL ? `${formatNumber(product.sheets, locale)} ورقة` : `${product.sheets} sheets`;

  // Low stock is espresso on terracotta (4.59:1); cream on it was 3.32:1 at
  // 11–12 px.
  const badge = isOutOfStock
    ? { text: t.common.soldOut, cls: 'bg-char text-cream font-medium' }
    : isLowStock
    ? { text: `${t.product.onlyLeft} ${formatNumber(product.stock, locale)} ${t.common.leftShort}`, cls: 'bg-terra text-esp font-semibold' }
    : product.featured
    ? { text: t.common.popular, cls: 'bg-maroon text-cream font-medium' }
    : null;

  const handleAdd = () => {
    if (isOutOfStock) return;
    addItem(product, 1);
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group flex flex-col">
      {/* No panel: the photos are composited onto the page colour itself. */}
      <Link href={href} className="relative block aspect-4/5 w-full overflow-hidden" aria-label={displayName}>
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
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading={priority ? 'eager' : undefined}
              onError={() => setImageFailed(true)}
              className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                isOutOfStock ? 'opacity-50' : ''
              }`}
            />
        )}
        {badge && (
          <span className={`absolute top-2 start-2 sm:top-3 sm:start-3 text-xs whitespace-nowrap px-2 py-1 ${badge.cls}`}>
            {badge.text}
          </span>
        )}
      </Link>

      <div className="pt-3 sm:pt-4 flex flex-col flex-1">
        <p className="text-xs uppercase tracking-wider text-muted">
          <SpecLine parts={[paperTypeLabel(product.paperType, locale), weight]} locale={locale} />
        </p>
        <Link href={href} className="mt-1 hover:text-maroon transition-colors">
          <h3 className="font-serif text-lg sm:text-xl font-semibold text-char leading-snug">
            <HeadingText text={displayName} locale={locale} />
          </h3>
        </Link>
        <p className="mt-1 text-xs sm:text-sm text-muted">
          <SpecLine parts={[sizeLabel(product.size, locale), sheetsLine]} locale={locale} />
        </p>
        <p className="mt-2 text-xs sm:text-sm text-char/80">
          <span className="text-muted">{t.product.bestFor}: </span>
          {goodFor}
        </p>

        <div className="mt-auto pt-4 flex flex-col gap-3">
          <p className="text-lg sm:text-xl font-semibold text-char">
            <Price value={product.price} locale={locale} currencyClassName="text-sm font-normal text-muted" />
            {product.compareAt > product.price && (
              <span className="ms-2 text-sm font-normal text-muted line-through tabular-nums">
                {formatPriceAmount(product.compareAt, locale)}
              </span>
            )}
          </p>
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAdd}
            aria-live="polite"
            className={`w-full inline-flex items-center justify-center gap-2 border text-sm font-medium py-2.5 transition-colors cursor-pointer disabled:cursor-not-allowed ${
              isOutOfStock
                ? 'border-line text-muted'
                : added
                ? 'border-maroon bg-maroon text-cream'
                : 'border-maroon text-maroon hover:bg-maroon hover:text-cream'
            }`}
          >
            <Icon name={added ? 'check' : 'bag'} size={16} />
            {isOutOfStock ? t.common.soldOut : added ? t.product.added : t.shop.addToBag}
          </button>
        </div>
      </div>
    </article>
  );
}
