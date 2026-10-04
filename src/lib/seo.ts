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
  process.env.NEXT_PUBLIC_SITE_URL || 'https://waraqa.art'
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

/**
 * Share card for every page that has no image of its own. Exactly 1200×630 and
 * under 100 kB: WhatsApp drops the preview for images over ~300 kB, and the old
 * card (the 816 kB hero photo, declared 1200×630 but really 1376×768) was over.
 */
export const OG_IMAGE = {
  url: `${SITE_URL}/og-image.jpg`,
  width: 1200,
  height: 630,
  alt: 'Waraqa handmade sketchbooks on a wooden desk',
};

/**
 * Base OpenGraph fields for a page. Next replaces the layout's `openGraph`
 * wholesale when a page sets its own, so every page that did lost the image and
 * site name. Spread this first; a page's own `images` or `type` then wins.
 */
export function ogDefaults(locale: Locale) {
  return {
    siteName: 'Waraqa',
    type: 'website' as const,
    images: [OG_IMAGE],
    ...ogLocale(locale),
  };
}

/**
 * Trim body copy to a meta description Google will show whole (~155 chars),
 * cutting at a word boundary. Product descriptions come from the Sheet and run
 * past 190 characters in Arabic.
 */
export function metaDescription(text: string, max = 155): string {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,،.:;]+$/, '')}…`;
}
