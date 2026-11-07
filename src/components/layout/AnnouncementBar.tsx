'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Price from '@/components/ui/Price';
import { FREE_SHIP_OVER } from '@/lib/constants';

export default function AnnouncementBar() {
  const { t, locale } = useLanguage();

  return (
    <aside aria-label={t.announcement.label} className="bg-maroon text-cream/90 text-xs py-2 px-4 text-center">
      {t.announcement.freeShippingPrefix} <Price value={FREE_SHIP_OVER} locale={locale} />{' '}
      {t.announcement.freeShippingSuffix}
    </aside>
  );
}
