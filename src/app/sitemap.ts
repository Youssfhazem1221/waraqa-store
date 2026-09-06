import type { MetadataRoute } from 'next';
import type { Product } from '@/types';
import productsData from '@/data/products.json';
import { SITE_URL, LOCALES } from '@/lib/seo';

const products = productsData as Product[];

/**
 * Built from the bundled catalog rather than the live Apps Script feed: a sitemap
 * must be generated deterministically at build time, and the slug set only changes
 * on deploy. Prices and stock are not sitemap data.
 */
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

  const lastModified = new Date();

  return paths.flatMap(({ path, priority, changeFrequency }) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`])
        ),
      },
    }))
  );
}
