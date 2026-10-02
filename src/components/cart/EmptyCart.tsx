'use client';

import React from 'react';
import Link from 'next/link';
import { buttonClasses } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';

export default function EmptyCart() {
  const { t, lp } = useLanguage();
  return (
    <div className="max-w-md mx-auto my-16 text-center">
      <h2 className="font-serif text-3xl font-semibold text-char">{t.cart.emptyTitle}</h2>
      <p className="mt-3 text-muted leading-relaxed">{t.cart.emptyMessage}</p>
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 items-center">
        <Link href={lp('/shop')} className={buttonClasses({ size: 'lg' })}>
          {t.cart.exploreBtn}
        </Link>
        <Link href={`${lp('/')}#paper-guide`} className="text-maroon underline underline-offset-4">
          {t.hero.storyCta}
        </Link>
      </div>
    </div>
  );
}
