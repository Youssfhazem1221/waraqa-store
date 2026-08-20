'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={`inline-flex items-center p-1 bg-white/80 border border-line rounded-xl text-xs font-semibold select-none shadow-2xs ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`px-2.5 py-2 rounded-lg transition-all duration-150 cursor-pointer ${
          locale === 'en'
            ? 'bg-maroon text-cream font-bold shadow-xs'
            : 'text-char/70 hover:text-maroon'
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLocale('ar')}
        className={`px-2.5 py-2 rounded-lg transition-all duration-150 font-arabic cursor-pointer ${
          locale === 'ar'
            ? 'bg-maroon text-cream font-bold shadow-xs'
            : 'text-char/70 hover:text-maroon'
        }`}
      >
        عربي
      </button>
    </div>
  );
}
