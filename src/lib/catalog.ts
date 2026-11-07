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
// site within CATALOG_CACHE_SECONDS of the next visit.
//
// Stale-while-revalidate: once the cache is past CATALOG_CACHE_SECONDS the
// page is rendered from the copy it has and Apps Script is asked again in the
// background (`after`, which OpenNext runs on the Worker's waitUntil). Waiting
// on Apps Script inline cost 1–3 s of server time on most visits — at this
// store's traffic the 60-second cache was usually cold — and that delay sat in
// front of every byte of HTML. A copy older than CATALOG_STALE_SECONDS is not
// served up front; that visitor waits for a fresh read, and only if that read
// fails gets the last good copy, which the edge keeps for EDGE_KEEP_SECONDS.
// The home and shop pages re-read the live catalog in the browser, the bag and
// checkout re-check every line, and the order endpoint re-prices against the
// Sheet regardless (waraqa-apps-script.gs), so a stale price can be displayed
// but never charged.
// ============================================================

import { cache } from 'react';
import { after } from 'next/server';
import type { Product, ApiProduct } from '@/types';
import { WEB_APP_URL, CATALOG_TIMEOUT_MS, CATALOG_REFRESH_TIMEOUT_MS } from './constants';
import { mapApiProduct } from './api';
import fallbackProducts from '@/data/products.json';

const FALLBACK = fallbackProducts as Product[];

/** How long a fetched catalog is reused before asking Apps Script again. */
export const CATALOG_CACHE_SECONDS = 60;

/**
 * Oldest copy that may be shown while a fresh one is fetched in the background.
 * A day rather than an hour: the store can easily go an hour without a visitor,
 * and past this window the next one waited on Apps Script inline (2–35 s when
 * measured on 2026-10-06) and, if it timed out, was shown the bundled
 * snapshot's out-of-date prices.
 */
export const CATALOG_STALE_SECONDS = 24 * 60 * 60;

/**
 * How long the edge keeps the last good catalog. Past the stale window it is
 * only a fallback for when Apps Script fails, and a week-old copy of the Sheet
 * is still far closer to the truth than the build-time snapshot.
 */
const EDGE_KEEP_SECONDS = 7 * 24 * 60 * 60;

const CATALOG_URL = `${WEB_APP_URL}?what=products`;
const FETCHED_AT = 'x-waraqa-fetched-at';

type Snapshot = { products: Product[]; at: number };

// Per-isolate copy: the cheapest hit, and the last good catalog to fall back to
// if Apps Script is down.
let memory: Snapshot | null = null;

// One background refresh at a time per isolate, however many requests see the
// cache go stale together.
let refreshing: Promise<unknown> | null = null;

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

async function fromEdge(): Promise<Snapshot | null> {
  const edge = edgeCache();
  if (!edge) return null;
  try {
    const hit = await edge.match(CATALOG_URL);
    if (!hit) return null;
    // Entries written before the timestamp existed count as already stale.
    const at = Number(hit.headers.get(FETCHED_AT)) || 0;
    return { products: parse(await hit.json()), at };
  } catch {
    return null;
  }
}

async function fromNetwork(timeoutMs: number): Promise<Snapshot> {
  const res = await fetch(CATALOG_URL, {
    cache: 'no-store',
    // A dead Apps Script deployment must not hang the render forever.
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const products = parse(data);
  const at = Date.now();

  const edge = edgeCache();
  if (edge) {
    // Stored under our own key with our own lifetime: Apps Script answers with
    // no-store, which the edge cache would otherwise honour. Kept well past
    // the stale window as a fallback; freshness is judged from FETCHED_AT,
    // not max-age.
    await edge
      .put(
        CATALOG_URL,
        new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': `public, max-age=${EDGE_KEEP_SECONDS}`,
            [FETCHED_AT]: String(at),
          },
        })
      )
      .catch(() => {});
  }
  return { products, at };
}

/** Fetch and remember a fresh catalog; never throws (a failed refresh keeps the old copy). */
function refresh(): Promise<unknown> {
  // Runs after the response has gone out, so it can wait longer than a render.
  refreshing ??= fromNetwork(CATALOG_REFRESH_TIMEOUT_MS)
    .then((snap) => {
      if (snap.products.length > 0) memory = snap;
    })
    .catch((err) => console.warn('[Waraqa] Background catalog refresh failed:', err))
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

function age(snap: Snapshot): number {
  return Date.now() - snap.at;
}

async function readCatalog(): Promise<Product[]> {
  if (!WEB_APP_URL) return FALLBACK;

  if (memory && age(memory) < CATALOG_CACHE_SECONDS * 1000) {
    return memory.products;
  }

  // The edge copy may be newer than this isolate's memory (another isolate in
  // the same location refreshed it), so look before deciding it is stale.
  const edge = await fromEdge();
  const best = [memory, edge]
    .filter((s): s is Snapshot => !!s && s.products.length > 0)
    .sort((a, b) => b.at - a.at)[0];

  if (best && age(best) < CATALOG_CACHE_SECONDS * 1000) {
    memory = best;
    return best.products;
  }

  if (best && age(best) < CATALOG_STALE_SECONDS * 1000) {
    memory = best;
    try {
      after(refresh);
    } catch {
      // Outside a request scope (build-time render): just start it.
      void refresh();
    }
    return best.products;
  }

  try {
    const snap = await fromNetwork(CATALOG_TIMEOUT_MS);
    if (snap.products.length === 0) return memory?.products ?? FALLBACK;
    memory = snap;
    return snap.products;
  } catch (err) {
    console.warn('[Waraqa] Server catalog read failed, using last good copy:', err);
    // A stale catalog is closer to the truth than the build-time snapshot.
    return best?.products ?? memory?.products ?? FALLBACK;
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
