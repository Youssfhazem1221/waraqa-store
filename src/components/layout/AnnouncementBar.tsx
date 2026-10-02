'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FREE_SHIP_OVER } from '@/lib/constants';

export default function AnnouncementBar() {
  const { t } = useLanguage();

  return (
    <aside aria-label="Announcement" className="bg-maroon text-cream/90 text-xs py-2 px-4 text-center">
      {t.announcement.freeShippingPrefix} {FREE_SHIP_OVER} {t.common.currency} {t.announcement.freeShippingSuffix}
    </aside>
  );
}
