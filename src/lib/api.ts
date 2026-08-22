// ============================================================
// Waraqa Store — API Helpers for Google Apps Script
// ============================================================
// The "backend" is a Google Apps Script Web App.
// All POSTs use Content-Type: text/plain to avoid CORS preflight.
// ============================================================

import type { Product, ApiProduct, OrderPayload, OrderResponse } from '@/types';
import { WEB_APP_URL } from './constants';
import fallbackProducts from '@/data/products.json';

/**
 * Map an API product (from the Sheet) to our full Product type.
 * The Sheet doesn't have all fields (slug, images array, etc.),
 * so we merge with fallback data when available.
 */
function mapApiProduct(api: ApiProduct): Product {
  const slug = api.name
    .toLowerCase()
    .replace(/[—–]/g, '-')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Try to find matching fallback product for extra fields
  const fallback = (fallbackProducts as Product[]).find((p) => p.sku === api.sku);

  return {
    sku: api.sku,
    name: api.name,
    nameAr: api.nameAr || fallback?.nameAr || '',
    category: api.category || fallback?.category || 'Sketchbooks',
    size: api.size || fallback?.size || 'A5',
    sheets: api.sheets || fallback?.sheets || 0,
    gsm: api.gsm || fallback?.gsm || 0,
    paperType: api.paperType || fallback?.paperType || '',
    price: api.price,
    compareAt: api.compareAt || 0,
    stock: api.stock,
    status: (api.status as Product['status']) || 'Active',
    image: fallback?.image || `/products/${api.image}`,
    images: fallback?.images || [`/products/${api.image}`],
    description: api.description || fallback?.description || '',
    featured: api.featured,
    slug: fallback?.slug || slug,
  };
}

/**
 * Fetch products from the Apps Script.
 * Falls back to the bundled products.json if the fetch fails.
 */
export async function fetchProducts(): Promise<Product[]> {
  if (!WEB_APP_URL) {
    console.warn('[Waraqa] WEB_APP_URL not set — using bundled product data');
    return fallbackProducts as Product[];
  }

  try {
    const res = await fetch(`${WEB_APP_URL}?what=products`, {
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!data.ok || !Array.isArray(data.products)) {
      throw new Error(data.error || 'Invalid response');
    }

    const products = data.products
      .map((p: ApiProduct) => mapApiProduct(p))
      .filter((p: Product) => p.status !== 'Hidden');

    return products.length > 0 ? products : (fallbackProducts as Product[]);
  } catch (err) {
    console.warn('[Waraqa] Failed to fetch products, using fallback:', err);
    return fallbackProducts as Product[];
  }
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
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    return data as OrderResponse;
  } catch (err) {
    console.error('[Waraqa] Order submission failed:', err);
    return { ok: false, error: 'Failed to submit order. Please try again in a moment.' };
  }
}

