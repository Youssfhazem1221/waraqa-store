'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import Price from '@/components/ui/Price';
import { FREE_SHIP_OVER } from '@/lib/constants';

/**
 * How far the bag is from free delivery: one sentence with the bar under it.
 * The bag page and the slide-in bag share it, so the two cannot drift apart;
 * the bag page had its own version, headed by a stray "Free shipping meter".
 */
export default function FreeShipMeter() {
  const { subtotal } = useCart();
  const { t, locale } = useLanguage();

  const toFree = Math.max(0, FREE_SHIP_OVER - subtotal);
  const progress = Math.min(100, Math.round((subtotal / FREE_SHIP_OVER) * 100));
  // The amount sits mid-sentence in Arabic and first in English.
  const [before, after = ''] = t.cart.toFreeShip.split('{amount}');

  return (
    <div>
      <p className="text-sm text-char">
        {toFree > 0 ? (
          <>
            {before}
            <Price value={toFree} locale={locale} className="font-semibold" />
            {after}
          </>
        ) : (
          t.cart.qualifyFreeShip
        )}
      </p>
      <div className="mt-2 h-1 bg-line">
        <div className="h-full bg-maroon transition-[width] duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
