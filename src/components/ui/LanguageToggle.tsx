'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  // One link-style switch to the *other* language. Two segmented buttons with
  // a filled active state read as a settings control, not a storefront.
  const next = locale === 'en' ? 'ar' : 'en';

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      lang={next}
      className={`text-sm font-medium text-current opacity-80 hover:opacity-100 underline-offset-4 hover:underline cursor-pointer py-2 ${
        next === 'ar' ? 'font-arabic' : ''
      } ${className}`}
      aria-label={next === 'ar' ? 'التبديل إلى العربية' : 'Switch to English'}
    >
      {next === 'ar' ? 'عربي' : 'English'}
    </button>
  );
}
