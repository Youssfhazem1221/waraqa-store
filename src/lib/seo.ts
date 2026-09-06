// ============================================================
// Waraqa Store — SEO helpers (canonical origin, locale URLs, hreflang)
// ============================================================

import type { Locale } from '@/lib/translations';

/**
 * Canonical origin for every absolute URL the site emits.
 *
 * Previously `metadataBase` and `openGraph.url` disagreed (a vercel.app fallback
 * against a hardcoded waraqa.store), which makes canonical and OG URLs resolve to
 * different hosts. One value, one source.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://waraqastore.vercel.app'
).replace(/\/+$/, '');

export const LOCALES = ['en', 'ar'] as const;
export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string | undefined): value is Locale {
  return value === 'en' || value === 'ar';
}

/** `/ar` + `/shop` → `/ar/shop`; `/ar` + `/` → `/ar`. */
export function localePath(locale: Locale, path: string = '/'): string {
  const clean = path === '/' ? '' : `/${path.replace(/^\/+|\/+$/g, '')}`;
  return `/${locale}${clean}`;
}

export function absoluteUrl(locale: Locale, path: string = '/'): string {
  return `${SITE_URL}${localePath(locale, path)}`;
}

/**
 * Canonical + hreflang for one page. `x-default` points at English because that
 * is what an unknown-locale visitor gets from the middleware.
 */
export function seoAlternates(locale: Locale, path: string = '/') {
  return {
    canonical: localePath(locale, path),
    languages: {
      en: localePath('en', path),
      ar: localePath('ar', path),
      'x-default': localePath('en', path),
    },
  };
}

/** OpenGraph locale tags — `ar_EG` because the store ships only inside Egypt. */
export function ogLocale(locale: Locale) {
  return {
    locale: locale === 'ar' ? 'ar_EG' : 'en_US',
    alternateLocale: locale === 'ar' ? 'en_US' : 'ar_EG',
  };
}
