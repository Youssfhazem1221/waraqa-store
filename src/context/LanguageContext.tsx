'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, type Locale } from '@/lib/translations';

interface LanguageContextValue {
  locale: Locale;
  isRTL: boolean;
  t: typeof translations.en;
  setLocale: (loc: Locale) => void;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'waraqa-lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always start as 'en' so the first client render matches the server-rendered
  // HTML (avoids a hydration mismatch). The stored/browser preference is applied
  // in an effect right after mount.
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored === 'ar' || stored === 'en') {
        setLocaleState(stored);
        return;
      }
      if (navigator.language?.startsWith('ar')) setLocaleState('ar');
    } catch {
      // Ignore
    }
  }, []);

  // Update HTML tag dir and lang attributes
  useEffect(() => {
    const isRTL = locale === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    if (isRTL) {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // Ignore
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next = prev === 'en' ? 'ar' : 'en';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const isRTL = locale === 'ar';
  const t = translations[locale] || translations.en;

  return (
    <LanguageContext.Provider
      value={{
        locale,
        isRTL,
        t,
        setLocale,
        toggleLocale,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
