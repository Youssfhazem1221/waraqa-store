'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types';
import { buttonClasses } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';
import { formatAmount } from '@/lib/money';

export default function HeroSection({ products }: { products: Product[] }) {
  const { t, lp } = useLanguage();

  // Derived from the live catalog rather than written into the copy, so a
  // price change in the Sheet can never leave the hero quoting an old number.
  const fromPrice = useMemo(() => {
    const prices = products
      .filter((p) => p.status === 'Active' && p.stock > 0 && p.price > 0)
      .map((p) => p.price);
    return prices.length ? Math.min(...prices) : 0;
  }, [products]);

  return (
    <section aria-labelledby="hero-title" className="border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <div className="lg:col-span-6 order-2 lg:order-1">
          <p className="text-sm text-muted">{t.hero.badge}</p>

          <h1
            id="hero-title"
            className="mt-4 font-serif font-semibold text-maroon text-5xl sm:text-6xl lg:text-7xl leading-[0.98] tracking-tight"
          >
            {t.hero.titleLine1}
            <br />
            <span className="italic font-normal text-char">{t.hero.titleLine2}</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-char">{t.hero.subtitle}</p>
          <p className="mt-3 max-w-lg text-base leading-relaxed text-muted">{t.hero.description}</p>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <Link href={lp('/shop')} className={buttonClasses({ size: 'lg', className: 'whitespace-nowrap' })}>
              {t.hero.shopCta}
              {fromPrice > 0 && (
                <span className="font-normal text-cream/75">
                  · {t.hero.fromPrice} {formatAmount(fromPrice)} {t.common.currency}
                </span>
              )}
            </Link>
            <a
              href="#paper-guide"
              className="text-maroon underline underline-offset-4 decoration-1 hover:decoration-2 py-2 whitespace-nowrap"
            >
              {t.hero.storyCta}
            </a>
          </div>

          <ul className="mt-10 pt-6 border-t border-line flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <li>{t.hero.specAcidFree}</li>
            <li>{t.hero.specDelivery}</li>
            <li>{t.hero.specCod}</li>
          </ul>
        </div>

        <div className="lg:col-span-6 order-1 lg:order-2">
          <div className="relative aspect-4/5 sm:aspect-5/4 lg:aspect-4/5 w-full overflow-hidden bg-kraft/30">
            {/* The LCP element: priority, never lazy. Decorative — the copy
                beside it carries the meaning. */}
            <Image
              src="/lifestyle/lifestyle-2.jpeg"
              alt=""
              aria-hidden
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
