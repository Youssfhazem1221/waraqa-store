'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Price from '@/components/ui/Price';
import { freeShipOver } from '@/lib/constants';
import { useShippingZones } from '@/context/ShippingContext';

export default function AnnouncementBar() {
  const { t, locale } = useLanguage();
  const threshold = freeShipOver(useShippingZones());
  // No zone ships free right now: nothing to announce.
  if (!threshold) return null;

  return (
    <aside aria-label={t.announcement.label} className="bg-maroon text-cream/90 text-xs py-2 px-4 text-center">
      {t.announcement.freeShippingPrefix} <Price value={threshold} locale={locale} />{' '}
      {t.announcement.freeShippingSuffix}
    </aside>
  );
}
