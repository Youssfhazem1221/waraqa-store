// ============================================================
// Waraqa Store — Server-side catalog reads
// ============================================================
// Separate from lib/api.ts on purpose. The client helper must always bypass the
// HTTP cache (`no-store`) so a shopper never sees a stale price; a server
// component doing the same thing opts its whole route out of static generation
// and makes every request wait on Apps Script. Here we let Next cache the
// upstream response and revalidate it on a timer instead.
// ============================================================

import { cache } from 'react';
import type { Product, ApiProduct } from '@/types';
import { WEB_APP_URL, CATALOG_TIMEOUT_MS } from './constants';
import { mapApiProduct } from './api';
import fallbackProducts from '@/data/products.json';

const FALLBACK = fallbackProducts as Product[];

/** Seconds the fetched catalog stays valid in Next's data cache. */
export const CATALOG_REVALIDATE_SECONDS = 300;

async function readCatalog(): Promise<Product[]> {
  if (!WEB_APP_URL) return FALLBACK;

  try {
    const res = await fetch(`${WEB_APP_URL}?what=products`, {
      next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ['catalog'] },
      // A dead Apps Script deployment must not hang the render forever.
      signal: AbortSignal.timeout(CATALOG_TIMEOUT_MS),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!data?.ok || !Array.isArray(data.products)) {
      throw new Error(data?.error || 'Invalid response');
    }

    const products = (data.products as ApiProduct[])
      .filter((p) => p && p.sku)
      .map((p) => mapApiProduct(p))
      .filter((p) => p.status !== 'Hidden');

    return products.length > 0 ? products : FALLBACK;
  } catch (err) {
    console.warn('[Waraqa] Server catalog read failed, using bundled data:', err);
    return FALLBACK;
  }
}

/**
 * Read the catalog for a server component.
 *
 * Wrapped in React's `cache` so generateMetadata and the page body share one
 * result. Next's own fetch memoization would normally do this, but passing an
 * abort signal opts a request out of it — and we want the timeout — so the
 * de-duplication happens here instead.
 *
 * Falls back to the bundled snapshot when the backend is unreachable, so a
 * flaky Apps Script deployment degrades the page rather than breaking it.
 */
export const getCatalog = cache(readCatalog);
