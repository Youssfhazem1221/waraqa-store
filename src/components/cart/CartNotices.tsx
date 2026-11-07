'use client';

import React from 'react';
import type { CartNotice } from '@/lib/useCartRevalidation';
import { useLanguage } from '@/context/LanguageContext';
import Icon from '@/components/ui/Icon';
import Price from '@/components/ui/Price';
import { shortName } from '@/lib/api';

/** What changed in the bag since it was filled (see useCartRevalidation). */
export default function CartNotices({ notices }: { notices: CartNotice[] }) {
  const { t, isRTL, locale } = useLanguage();
  if (notices.length === 0) return null;

  const describe = (n: CartNotice): React.ReactNode => {
    if (n.kind === 'repriced') {
      return (
        <>
          {t.cart.priceChanged} {t.cart.priceChangeFrom && `${t.cart.priceChangeFrom} `}
          <Price value={n.oldPrice} locale={locale} /> {t.cart.priceChangeTo}{' '}
          <Price value={n.product.price} locale={locale} />
        </>
      );
    }
    if (n.kind === 'reduced') return t.cart.qtyReduced;
    const soldOut = n.product.stock <= 0 || n.product.status !== 'Active';
    return soldOut ? t.cart.removedSoldOut : t.cart.removedUnavailable;
  };

  return (
    <div
      role="status"
      className="mb-8 bg-warning/10 border border-warning/30 rounded-2xl p-4 sm:p-5 space-y-2"
    >
      <div className="flex items-center gap-2 font-semibold text-sm text-char">
        <Icon name="box" size={16} className="text-warning" />
        <span>{t.cart.updatedTitle}</span>
      </div>
      <ul className="text-xs text-muted space-y-1 ps-6 list-disc">
        {notices.map((n) => (
          <li key={`${n.kind}-${n.product.sku}`}>
            {shortName(isRTL ? n.product.nameAr || n.product.name : n.product.name)}: {describe(n)}
          </li>
        ))}
      </ul>
    </div>
  );
}
