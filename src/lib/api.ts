// ============================================================
// Waraqa Store — API Helpers for Google Apps Script
// ============================================================
// The "backend" is a Google Apps Script Web App.
// All POSTs use Content-Type: text/plain to avoid CORS preflight.
// ============================================================

import type { Product, ApiProduct, OrderPayload, OrderResponse, CartItem } from '@/types';
import {
  WEB_APP_URL,
  CATALOG_TTL_MS,
  CATALOG_TIMEOUT_MS,
  CATALOG_REFRESH_TIMEOUT_MS,
  ORDER_TIMEOUT_MS,
  MAX_LINE_QTY,
} from './constants';
import fallbackProducts from '@/data/products.json';

const FALLBACK = fallbackProducts as Product[];

/** SKU -> bundled product, built once instead of a linear scan per API row. */
const fallbackBySku: Map<string, Product> = new Map(FALLBACK.map((p) => [p.sku, p]));

/** Turn a product name into a URL-safe slug. */
export function slugify(name: string): string {
  return String(name || '')
    .toLowerCase()
    .replace(/[—–]/g, '-')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    // Collapse dash runs and strip the leading/trailing ones that a name like
    // " A5 — Kraft " would otherwise leave behind ("-a5-kraft-").
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * "A5 Kraft Sketchbook, 40 Sheets, 180gsm" -> "A5 Kraft Sketchbook". For places
 * that show the specs on their own line. The Sheet separates with commas, the
 * bundled catalog with an em dash.
 */
export function shortName(name: string): string {
  return String(name || '').split(/,|،| — /)[0].trim();
}

/**
 * The storefront never shows em dashes. The Sheet's names and descriptions are
 * typed by hand and use them as separators, so soften them on the way in: a
 * comma in a name, a comma or Arabic comma in running text.
 */
function noEmDash(text: string, arabic = false): string {
  return String(text || '')
    .replace(/\s*—\s*/g, arabic ? '، ' : ', ')
    .trim();
}

/**
 * Map an API product (from the Sheet) to our full Product type.
 * The Sheet doesn't have all fields (slug, images array, etc.),
 * so we merge with fallback data when available.
 */
export function mapApiProduct(api: ApiProduct): Product {
  const fallback = fallbackBySku.get(api.sku);

  // The Sheet stores a bare filename; only prefix /products/ when the value
  // isn't already a path or an absolute URL.
  const rawImage = String(api.image || '').trim();
  const apiImage = !rawImage
    ? ''
    : /^(https?:)?\/\//.test(rawImage) || rawImage.startsWith('/')
      ? rawImage
      : `/products/${rawImage}`;

  const image = fallback?.image || apiImage || '/products/wrq-a5-kft.jpeg';

  return {
    sku: api.sku,
    name: noEmDash(api.name),
    nameAr: noEmDash(api.nameAr || fallback?.nameAr || '', true),
    category: api.category || fallback?.category || 'Sketchbooks',
    size: api.size || fallback?.size || 'A5',
    sheets: api.sheets || fallback?.sheets || 0,
    gsm: api.gsm || fallback?.gsm || 0,
    paperType: api.paperType || fallback?.paperType || '',
    price: Number(api.price) || 0,
    compareAt: Number(api.compareAt) || 0,
    stock: Number(api.stock) || 0,
    status: (api.status as Product['status']) || 'Active',
    image,
    images: fallback?.images?.length ? fallback.images : [image],
    description: noEmDash(api.description || fallback?.description || ''),
    descriptionAr: noEmDash(api.descriptionAr || fallback?.descriptionAr || '', true),
    featured: Boolean(api.featured),
    slug: fallback?.slug || slugify(api.name),
  };
}

// ---- Catalog cache -------------------------------------------------
// The catalog is read on the home page, the shop page, every product page and
// again when the cart revalidates. Without a cache each of those is its own
// round-trip to Apps Script (slow — often over a second). One shared,
// short-lived cache plus in-flight de-duplication collapses them into a single
// request per TTL window.

// Bump when the mapped Product shape or its bundled fields (e.g. images) change,
// so an open tab does not keep serving the previous mapping from storage.
const SESSION_CACHE_KEY = 'waraqa-catalog-v2';

interface CacheEntry {
  products: Product[];
  at: number;
}

let memoryCache: CacheEntry | null = null;
let inFlight: Promise<Product[] | null> | null = null;

function readSessionCache(): CacheEntry | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.at === 'number' &&
      Array.isArray(parsed.products) &&
      parsed.products.length > 0
    ) {
      return parsed as CacheEntry;
    }
  } catch {
    // A corrupt cache is just a miss.
  }
  return null;
}

function writeSessionCache(entry: CacheEntry) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Quota or private mode — the in-memory cache still applies.
  }
}

function isFresh(entry: CacheEntry | null): boolean {
  return Boolean(entry && Date.now() - entry.at < CATALOG_TTL_MS);
}

/** Drop the cached catalog so the next read goes to the network. */
export function invalidateCatalog() {
  memoryCache = null;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(SESSION_CACHE_KEY);
    } catch {
      // Ignore
    }
  }
}

async function requestProducts(): Promise<Product[]> {
  // Every browser read corrects data already on screen, so nobody waits on it.
  const res = await fetch(`${WEB_APP_URL}?what=products`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(CATALOG_REFRESH_TIMEOUT_MS),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  if (!data.ok || !Array.isArray(data.products)) {
    throw new Error(data.error || 'Invalid response');
  }

  return (data.products as ApiProduct[])
    .filter((p) => p && p.sku)
    .map((p) => mapApiProduct(p))
    .filter((p) => p.status !== 'Hidden');
}

/**
 * The catalog as the Sheet has it right now, or `null` when it could not be
 * read fresh.
 *
 * There is deliberately no fallback here. Every caller already holds product
 * data (a server-rendered page, a cart line) and only wants to correct it.
 * Falling back to the bundled products.json used to "correct" live prices with
 * build-time ones: Apps Script often takes 10–30 s to answer, the read timed
 * out, and the page swapped e.g. 250 EGP for the snapshot's 210 a few seconds
 * after it loaded, while checkout still charged 250.
 */
export async function fetchLiveProducts(): Promise<Product[] | null> {
  if (!WEB_APP_URL) return null;

  if (isFresh(memoryCache)) return memoryCache!.products;

  const stored = readSessionCache();
  if (isFresh(stored)) {
    memoryCache = stored;
    return stored!.products;
  }

  // Share one request between concurrent callers (e.g. the shop page and a
  // cart revalidation firing at the same moment).
  if (inFlight) return inFlight;

  inFlight = requestProducts()
    .then((products) => {
      if (products.length === 0) return null;
      const entry: CacheEntry = { products, at: Date.now() };
      memoryCache = entry;
      writeSessionCache(entry);
      return products;
    })
    .catch((err) => {
      console.warn('[Waraqa] Could not refresh the catalog; keeping what is on screen:', err);
      return null;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

/**
 * Re-check cart lines against the live catalog.
 *
 * Cart items are snapshots persisted in localStorage, so a bag left open for a
 * week can carry last week's price and a stock count that has since gone to
 * zero. This refreshes each line and reports what changed, so the shopper sees
 * it before they pay rather than after.
 */
export interface CartRevalidation {
  items: CartItem[];
  removed: CartItem[];
  repriced: { item: CartItem; oldPrice: number }[];
  reduced: { item: CartItem; oldQty: number }[];
}

/**
 * Compare cart lines with a catalog freshly read from the Sheet (see
 * fetchLiveProducts). Pure, so the caller can run it against whatever the bag
 * holds by the time the slow catalog read comes back.
 */
export function reconcileCart(items: CartItem[], live: Product[]): CartRevalidation {
  const result: CartRevalidation = { items: [], removed: [], repriced: [], reduced: [] };
  const bySku = new Map(live.map((p) => [p.sku, p]));

  for (const item of items) {
    const current = bySku.get(item.product.sku);

    // Missing from a catalog that was just read successfully: hidden or deleted
    // in the Sheet, and the order endpoint would refuse the whole order over it.
    // (A failed read never gets this far, so a backend hiccup cannot empty a bag.)
    if (!current) {
      result.removed.push(item);
      continue;
    }

    const soldOut = current.stock <= 0 || current.status !== 'Active';
    if (soldOut) {
      result.removed.push({ ...item, product: current });
      continue;
    }

    const qty = Math.min(item.qty, current.stock, MAX_LINE_QTY);
    const next: CartItem = { product: current, qty };
    result.items.push(next);

    if (current.price !== item.product.price) {
      result.repriced.push({ item: next, oldPrice: item.product.price });
    }
    if (qty !== item.qty) {
      result.reduced.push({ item: next, oldQty: item.qty });
    }
  }

  return result;
}

/**
 * Create an order by POSTing to the Apps Script.
 * Uses Content-Type: text/plain to avoid CORS preflight issues.
 */
export async function createOrder(payload: OrderPayload): Promise<OrderResponse> {
  if (!WEB_APP_URL) {
    return { ok: false, error: 'Store backend not configured' };
  }

  try {
    const res = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(ORDER_TIMEOUT_MS),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    // Stock just moved — the next catalog read must not serve a cached count.
    if (data?.ok) invalidateCatalog();

    return data as OrderResponse;
  } catch (err) {
    console.error('[Waraqa] Order submission failed:', err);
    // Running out of patience is not a failure we can report: Apps Script
    // finishes the order after the browser stops waiting. Flag it so checkout
    // says "it may have gone through" instead of inviting a second order.
    if ((err as Error)?.name === 'TimeoutError') {
      return { ok: false, timedOut: true };
    }
    return { ok: false, error: 'Failed to submit order. Please try again in a moment.' };
  }
}

/** Subscribe an email address to the newsletter. */
export async function subscribeNewsletter(
  email: string,
  locale: string
): Promise<{ ok: boolean; error?: string }> {
  if (!WEB_APP_URL) return { ok: false, error: 'not-configured' };

  try {
    const res = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'subscribe', email, locale, source: 'storefront' }),
      signal: AbortSignal.timeout(CATALOG_TIMEOUT_MS),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { ok: data?.ok === true, error: data?.error };
  } catch (err) {
    console.error('[Waraqa] Newsletter signup failed:', err);
    return { ok: false, error: 'network' };
  }
}
