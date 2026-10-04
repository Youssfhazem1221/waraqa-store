'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types';
import { buttonClasses } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';
import { formatAmount } from '@/lib/money';
import { shortName } from '@/lib/api';

// Alternating tilt so the row reads as books set down by hand, not a grid.
const TILT = ['-rotate-3', 'rotate-2', '-rotate-1', 'rotate-3', '-rotate-2'];

export default function HeroSection({ products }: { products: Product[] }) {
  const { t, lp, isRTL } = useLanguage();

  // Derived from the live catalog rather than written into the copy, so a
  // price change in the Sheet can never leave the hero quoting an old number.
  const fromPrice = useMemo(() => {
    const prices = products
      .filter((p) => p.status === 'Active' && p.stock > 0 && p.price > 0)
      .map((p) => p.price);
    return prices.length ? Math.min(...prices) : 0;
  }, [products]);

  const shelf = useMemo(
    () =>
      products
        .filter((p) => p.status === 'Active' && p.image)
        .sort((a, b) => Number(b.featured) - Number(a.featured))
        .slice(0, 5),
    [products]
  );

  return (
    <section aria-labelledby="hero-title" className="border-b border-line overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 lg:pt-12 text-center">
        <p className="text-sm text-muted">{t.hero.badge}</p>
        <h1
          id="hero-title"
          className="mt-3 font-serif font-semibold text-maroon text-5xl sm:text-6xl lg:text-7xl leading-[1] tracking-tight text-balance"
        >
          {t.hero.titleLine1} <span className="font-light text-char">{t.hero.titleLine2}</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-char max-w-2xl mx-auto">{t.hero.subtitle}</p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center sm:items-center gap-3 sm:gap-6">
          <Link href={lp('/shop')} className={buttonClasses({ size: 'lg', className: 'whitespace-nowrap' })}>
            {t.hero.shopCta}
            {fromPrice > 0 && (
              <span className="font-normal text-cream/75">
                · {t.hero.fromPrice} {formatAmount(fromPrice)} {t.common.currency}
              </span>
            )}
          </Link>
          <Link
            href={lp('/paper-guide')}
            className="text-maroon underline underline-offset-4 decoration-1 hover:decoration-2 py-2 whitespace-nowrap"
          >
            {t.hero.storyCta}
          </Link>
        </div>
      </div>

      <div className="relative mt-8 sm:mt-10">
        <ul className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-3 sm:gap-5 overflow-x-auto lg:overflow-visible pb-1 snap-x lg:justify-center">
          {shelf.map((p, i) => {
            const name = isRTL ? p.nameAr || p.name : p.name;
            return (
              <li key={p.sku} className="shrink-0 snap-center">
                <Link
                  href={lp(`/product/${p.slug}`)}
                  className={`group block w-32 sm:w-40 lg:w-44 transition-transform duration-200 hover:-translate-y-2 ${TILT[i % TILT.length]}`}
                >
                  {/* The studio shots sit on the page's own cream, so the books
                      appear set straight onto the shelf. The first two are LCP
                      candidates and must not be lazy. */}
                  <div className="relative aspect-4/5">
                    <Image
                      src={p.image}
                      alt={name}
                      fill
                      loading={i < 2 ? 'eager' : undefined}
                      sizes="(max-width: 640px) 128px, 176px"
                      className="object-contain"
                    />
                  </div>
                  <span className="mt-2 block text-[13px] leading-snug text-char line-clamp-1 group-hover:text-maroon">
                    {shortName(name)}
                  </span>
                  <span className="block text-[13px] font-semibold text-maroon tabular-nums">
                    {formatAmount(p.price)} {t.common.currency}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div aria-hidden className="h-3 bg-kraft border-t border-[#a98a6f] shadow-[0_6px_10px_rgba(32,21,19,.15)]" />
      </div>

      <ul className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-muted">
        <li>{t.hero.specAcidFree}</li>
        <li>{t.hero.specDelivery}</li>
        <li>{t.hero.specCod}</li>
      </ul>
    </section>
  );
}
