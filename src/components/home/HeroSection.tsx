'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types';
import { buttonClasses } from '@/components/ui/Button';
import Price from '@/components/ui/Price';
import { useLanguage } from '@/context/LanguageContext';
import { shortName } from '@/lib/api';

export default function HeroSection({ products }: { products: Product[] }) {
  const { t, lp, isRTL, locale } = useLanguage();

  // Derived from the live catalog rather than written into the copy, so a
  // price change in the Sheet can never leave the hero quoting an old number.
  const fromPrice = useMemo(() => {
    const prices = products
      .filter((p) => p.status === 'Active' && p.stock > 0 && p.price > 0)
      .map((p) => p.price);
    return prices.length ? Math.min(...prices) : 0;
  }, [products]);

  const books = useMemo(
    () =>
      products
        .filter((p) => p.status === 'Active' && p.image)
        .sort((a, b) => Number(b.featured) - Number(a.featured))
        .slice(0, 5),
    [products]
  );

  return (
    <section aria-labelledby="hero-title" className="border-b border-line overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 lg:pt-16 text-center">
        <p className="text-sm text-muted">{t.hero.badge}</p>
        <h1
          id="hero-title"
          className="mt-4 font-serif font-semibold text-maroon text-5xl sm:text-6xl lg:text-7xl leading-[1] rtl:leading-[1.2] tracking-tight text-balance"
        >
          {t.hero.titleLine1} <span className="font-light text-char">{t.hero.titleLine2}</span>
        </h1>
        <p className="mt-5 text-base sm:text-lg text-char max-w-xl mx-auto text-pretty">{t.hero.subtitle}</p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center sm:items-center gap-3 sm:gap-6">
          <Link href={lp('/shop')} className={buttonClasses({ size: 'lg', className: 'whitespace-nowrap' })}>
            {t.hero.shopCta}
            {fromPrice > 0 && (
              <span className="font-normal text-cream/75">
                · {t.hero.fromPrice} <Price value={fromPrice} locale={locale} />
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

      {/* A plain row of the books, upright and evenly spaced. It used to be a
          "shelf": tilted books over a kraft bar, which read as a stray brown
          line across the page (and the scroller's kraft scrollbar thumb as a
          second one), so there is no bar and no visible scrollbar. From lg up
          the five fill the width; below that the row scrolls sideways, and the
          faded edges and the cut-off book say there is more. pt-2 leaves room
          for a book to lift on hover without being clipped by the scroller. */}
      <ul className="max-w-6xl mx-auto mt-12 sm:mt-16 px-4 sm:px-6 lg:px-8 pt-2 flex gap-5 sm:gap-8 overflow-x-auto snap-x lg:grid lg:grid-cols-5 lg:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-lg:[mask-image:linear-gradient(to_right,transparent,#000_1rem,#000_calc(100%_-_1rem),transparent)]">
        {books.map((p, i) => {
          const name = isRTL ? p.nameAr || p.name : p.name;
          return (
            <li key={p.sku} className="shrink-0 snap-center w-36 sm:w-44 lg:w-auto">
              <Link href={lp(`/product/${p.slug}`)} className="group block text-center">
                {/* The studio shots sit on the page's own cream, so the books
                    appear set straight onto the page. The first two are LCP
                    candidates and must not be lazy. */}
                <div className="relative aspect-4/5 transition-transform duration-200 group-hover:-translate-y-1.5">
                  <Image
                    src={p.image}
                    alt={name}
                    fill
                    loading={i < 2 ? 'eager' : undefined}
                    sizes="(max-width: 640px) 144px, (max-width: 1024px) 176px, 192px"
                    className="object-contain"
                  />
                </div>
                <div className="mt-3 sm:mt-4">
                  {/* No `block` here: it overrode line-clamp's display, so long
                      names wrapped and knocked the prices out of line. */}
                  <span className="text-sm leading-snug text-char line-clamp-1 group-hover:text-maroon">
                    {shortName(name)}
                  </span>
                  <Price value={p.price} locale={locale} className="mt-0.5 block text-sm font-semibold text-maroon" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <ul className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-8 sm:pb-10 flex flex-wrap justify-center gap-x-8 gap-y-1.5 text-sm text-muted">
        <li>{t.hero.specAcidFree}</li>
        <li>{t.hero.specDelivery}</li>
        <li>{t.hero.specCod}</li>
      </ul>
    </section>
  );
}
