import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Transactional routes hold no indexable content and would only spend
        // crawl budget — and a cached /confirmation could leak an order state.
        disallow: [
          '/en/cart',
          '/ar/cart',
          '/en/checkout',
          '/ar/checkout',
          '/en/confirmation',
          '/ar/confirmation',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
