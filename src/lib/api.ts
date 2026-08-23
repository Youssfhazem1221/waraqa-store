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
  ORDER_TIMEOUT_MS,
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
    name: api.name,
    nameAr: api.nameAr || fallback?.nameAr || '',
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
    description: api.description || fallback?.description || '',
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

const SESSION_CACHE_KEY = 'waraqa-catalog-v1';

interface CacheEntry {
  products: Product[];
  at: number;
}

let memoryCache: CacheEntry | null = null;
let inFlight: Promise<Product[]> | null = null;

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
  const res = await fetch(`${WEB_APP_URL}?what=products`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(CATALOG_TIMEOUT_MS),
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
 * Fetch products from the Apps Script.
 * Falls back to the bundled products.json if the fetch fails.
 */
export async function fetchProducts(): Promise<Product[]> {
  if (!WEB_APP_URL) {
    console.warn('[Waraqa] WEB_APP_URL not set — using bundled product data');
    return FALLBACK;
  }

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
      if (products.length === 0) return FALLBACK;
      const entry: CacheEntry = { products, at: Date.now() };
      memoryCache = entry;
      writeSessionCache(entry);
      return products;
    })
    .catch((err) => {
      console.warn('[Waraqa] Failed to fetch products, using fallback:', err);
      // Prefer a stale cache over the bundled snapshot: it is closer to the
      // truth than a build-time copy.
      return stored?.products ?? memoryCache?.products ?? FALLBACK;
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

export async function revalidateCart(items: CartItem[]): Promise<CartRevalidation> {
  const result: CartRevalidation = { items: [], removed: [], repriced: [], reduced: [] };
  if (items.length === 0) return result;

  const live = await fetchProducts();
  const bySku = new Map(live.map((p) => [p.sku, p]));

  for (const item of items) {
    const current = bySku.get(item.product.sku);

    // Unknown SKU: keep the line rather than silently emptying a bag over a
    // backend hiccup. The order endpoint re-prices server-side regardless.
    if (!current) {
      result.items.push(item);
      continue;
    }

    const soldOut = current.stock <= 0 || current.status !== 'Active';
    if (soldOut) {
      result.removed.push({ ...item, product: current });
      continue;
    }

    const qty = Math.min(item.qty, current.stock);
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
