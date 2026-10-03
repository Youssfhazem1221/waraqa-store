// ============================================================
// Waraqa Store — Server-side catalog reads
// ============================================================
// Separate from lib/api.ts on purpose: the client helper is for the browser,
// this one runs during server rendering.
//
// Pages that show prices render on every request and read the catalog through
// here. This used to lean on ISR (`revalidate = 300` plus Next's fetch data
// cache), but on Cloudflare's free plan the background regeneration never
// completed: pages kept serving their deploy-time prices indefinitely. Prices
// now come from a short-lived cache we control, so a Sheet edit reaches the
// site within CATALOG_CACHE_SECONDS.
// ============================================================

import { cache } from 'react';
import type { Product, ApiProduct } from '@/types';
import { WEB_APP_URL, CATALOG_TIMEOUT_MS } from './constants';
import { mapApiProduct } from './api';
import fallbackProducts from '@/data/products.json';

const FALLBACK = fallbackProducts as Product[];

/** How long a fetched catalog is reused before asking Apps Script again. */
export const CATALOG_CACHE_SECONDS = 60;

const CATALOG_URL = `${WEB_APP_URL}?what=products`;

// Per-isolate copy: the cheapest hit, and the last good catalog to fall back to
// if Apps Script is down.
let memory: { products: Product[]; at: number } | null = null;

/** Cloudflare's per-location cache, when running on Workers (absent on Node). */
function edgeCache(): Cache | null {
  const c = (globalThis as { caches?: CacheStorage & { default?: Cache } }).caches;
  return c?.default ?? null;
}

function parse(data: unknown): Product[] {
  const body = data as { ok?: boolean; products?: ApiProduct[]; error?: string } | null;
  if (!body?.ok || !Array.isArray(body.products)) {
    throw new Error(body?.error || 'Invalid response');
  }
  return body.products
    .filter((p) => p && p.sku)
    .map((p) => mapApiProduct(p))
    .filter((p) => p.status !== 'Hidden');
}

async function fromEdge(): Promise<Product[] | null> {
  const edge = edgeCache();
  if (!edge) return null;
  try {
    const hit = await edge.match(CATALOG_URL);
    return hit ? parse(await hit.json()) : null;
  } catch {
    return null;
  }
}

async function fromNetwork(): Promise<Product[]> {
  const res = await fetch(CATALOG_URL, {
    cache: 'no-store',
    // A dead Apps Script deployment must not hang the render forever.
    signal: AbortSignal.timeout(CATALOG_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const products = parse(data);

  const edge = edgeCache();
  if (edge) {
    // Stored under our own key with our own lifetime: Apps Script answers with
    // no-store, which the edge cache would otherwise honour.
    await edge
      .put(
        CATALOG_URL,
        new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': `public, max-age=${CATALOG_CACHE_SECONDS}`,
          },
        })
      )
      .catch(() => {});
  }
  return products;
}

async function readCatalog(): Promise<Product[]> {
  if (!WEB_APP_URL) return FALLBACK;

  if (memory && Date.now() - memory.at < CATALOG_CACHE_SECONDS * 1000) {
    return memory.products;
  }

  try {
    const products = (await fromEdge()) ?? (await fromNetwork());
    if (products.length === 0) return memory?.products ?? FALLBACK;
    memory = { products, at: Date.now() };
    return products;
  } catch (err) {
    console.warn('[Waraqa] Server catalog read failed, using last good copy:', err);
    // A stale catalog is closer to the truth than the build-time snapshot.
    return memory?.products ?? FALLBACK;
  }
}

/**
 * Read the catalog for a server component.
 *
 * Wrapped in React's `cache` so generateMetadata and the page body share one
 * result within a request.
 *
 * Falls back to the last good copy, then the bundled snapshot, when the backend
 * is unreachable, so a flaky Apps Script deployment degrades the page rather
 * than breaking it.
 */
export const getCatalog = cache(readCatalog);
