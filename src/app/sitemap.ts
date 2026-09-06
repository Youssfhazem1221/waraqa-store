import type { MetadataRoute } from 'next';
import type { Product } from '@/types';
import productsData from '@/data/products.json';
import { SITE_URL, LOCALES, DEFAULT_LOCALE } from '@/lib/seo';

const products = productsData as Product[];

/**
 * Bump this by hand when page copy or the catalog actually changes.
 *
 * It replaces a build-time `new Date()`: that stamped every URL with the moment
 * of the last deploy, so a CSS-only push told Google all 22 pages had changed.
 * Crawlers discount a lastmod that moves without the content moving, which costs
 * us the signal exactly when we do ship a real content update.
 */
const CONTENT_REVISION = new Date('2026-09-06T00:00:00.000Z');

export default function sitemap(): MetadataRoute.Sitemap {
  const paths: {
    path: string;
    priority: number;
    changeFrequency: 'weekly' | 'monthly';
  }[] = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/shop', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
    ...products.map((p) => ({
      path: `/product/${p.slug}`,
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    })),
  ];

  return paths.flatMap(({ path, priority, changeFrequency }) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: CONTENT_REVISION,
      changeFrequency,
      priority,
      alternates: {
        languages: {
          ...Object.fromEntries(
            LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`])
          ),
          // Mirrors seoAlternates() in lib/seo.ts. Without it the sitemap and the
          // <head> disagree about what an unknown-locale visitor should get.
          'x-default': `${SITE_URL}/${DEFAULT_LOCALE}${path}`,
        },
      },
    }))
  );
}
