'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import Price from '@/components/ui/Price';
import { freeShipOver } from '@/lib/constants';
import { useShippingZones } from '@/context/ShippingContext';

/**
 * How far the bag is from free delivery: one sentence with the bar under it.
 * The bag page and the slide-in bag share it, so the two cannot drift apart;
 * the bag page had its own version, headed by a stray "Free shipping meter".
 */
export default function FreeShipMeter() {
  const { subtotal } = useCart();
  const { t, locale } = useLanguage();

  const threshold = freeShipOver(useShippingZones());
  const toFree = Math.max(0, threshold - subtotal);
  const progress = threshold ? Math.min(100, Math.round((subtotal / threshold) * 100)) : 0;
  // The amount sits mid-sentence in Arabic and first in English.
  const [before, after = ''] = t.cart.toFreeShip.split('{amount}');
  // No zone ships free right now: no meter.
  if (!threshold) return null;

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
