'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FREE_SHIP_OVER } from '@/lib/constants';

export default function AnnouncementBar() {
  const { t } = useLanguage();

  return (
    <aside aria-label="Announcement" className="bg-maroon text-cream text-xs sm:text-sm py-2 px-4 text-center font-medium tracking-wide border-b border-white/10 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
        <span>
          {t.announcement.freeShippingPrefix} <strong>{FREE_SHIP_OVER} {t.common.currency}</strong> {t.announcement.freeShippingSuffix}
        </span>
      </div>
    </aside>
  );
}
