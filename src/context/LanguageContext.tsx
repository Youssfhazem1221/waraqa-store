'use client';

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { translations, type Locale } from '@/lib/translations';
import { localePath } from '@/lib/seo';

interface LanguageContextValue {
  locale: Locale;
  isRTL: boolean;
  t: typeof translations.en;
  setLocale: (loc: Locale) => void;
  toggleLocale: () => void;
  /** Prefix a path with the current locale: `/shop` → `/ar/shop`. */
  lp: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Locale is now a URL fact passed down from the server layout, not a stored
 * preference. The middleware reads a `NEXT_LOCALE` cookie + Accept-Language to
 * redirect bare paths, and the `[locale]` segment decides what the server
 * renders. No `useEffect` needed for dir/lang — they are set on `<html>` at
 * render time.
 */
export function LanguageProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const isRTL = locale === 'ar';
  const router = useRouter();
  const pathname = usePathname();

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      // Read by the middleware on the next un-prefixed request, so a returning
      // visitor lands in the language they chose.
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
      const rest = pathname.replace(/^\/(en|ar)(?=\/|$)/, '');
      router.push(`/${next}${rest || ''}`);
    },
    [locale, pathname, router]
  );

  const toggleLocale = useCallback(
    () => setLocale(isRTL ? 'en' : 'ar'),
    [isRTL, setLocale]
  );

  const lp = useCallback(
    (path: string) => localePath(locale, path),
    [locale]
  );

  // Memoised so switching pages does not hand every consumer of this context a
  // brand-new value object and force a re-render of the whole tree.
  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      isRTL,
      t: translations[locale] || translations.en,
      setLocale,
      toggleLocale,
      lp,
    }),
    [locale, isRTL, setLocale, toggleLocale, lp]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
