'use client';

import React, { createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import { translations, type Locale } from '@/lib/translations';
import { useStoredString, writeStored } from '@/lib/useStoredValue';

interface LanguageContextValue {
  locale: Locale;
  isRTL: boolean;
  t: typeof translations.en;
  setLocale: (loc: Locale) => void;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'waraqa-lang';

function isLocale(value: string | null): value is Locale {
  return value === 'ar' || value === 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Reads as `null` on the server and during hydration, so the first client
  // render matches the server HTML; the stored preference then applies without
  // the extra render an effect-plus-setState would cost.
  const stored = useStoredString(STORAGE_KEY);
  const locale: Locale = isLocale(stored) ? stored : 'en';
  const isRTL = locale === 'ar';

  // First visit with an Arabic browser: adopt Arabic. This writes the
  // preference rather than calling setState, so the value still arrives through
  // the same external-store path and no hydration mismatch is possible.
  useEffect(() => {
    if (stored !== null) return;
    try {
      if (navigator.language?.toLowerCase().startsWith('ar')) {
        writeStored(STORAGE_KEY, 'ar');
      }
    } catch {
      // navigator.language can be unavailable in exotic environments.
    }
  }, [stored]);

  // Update the html tag's dir/lang so the browser lays the page out RTL and
  // reads it in the right language.
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    document.documentElement.classList.toggle('rtl', isRTL);
  }, [locale, isRTL]);

  const setLocale = useCallback((newLocale: Locale) => {
    writeStored(STORAGE_KEY, newLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    writeStored(STORAGE_KEY, isRTL ? 'en' : 'ar');
  }, [isRTL]);

  // Memoised so switching pages does not hand every consumer of this context a
  // brand-new value object and force a re-render of the whole tree.
  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      isRTL,
      t: translations[locale] || translations.en,
      setLocale,
      toggleLocale,
    }),
    [locale, isRTL, setLocale, toggleLocale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
