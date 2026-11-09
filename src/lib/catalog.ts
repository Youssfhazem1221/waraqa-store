// ============================================================
// Waraqa Store — Server-side catalog reads
// ============================================================
// Separate from lib/api.ts on purpose: the client helper is for the browser,
// this one runs during server rendering.
//
// The catalog comes from the waraqa-data Worker over a service binding. It
// keeps the Sheet in memory and drops that copy whenever the CRM (or an order)
// writes, so a price changed in the CRM is on the next page view. That made
// the old Apps Script workarounds unnecessary: the edge cache, the
// stale-while-revalidate window and the 2–35 s timeouts are gone.
//
// A short per-isolate memory still saves the binding round trip when one page
// reads the catalog several times, and is the fallback if the data Worker
// is ever unreachable. The order endpoint re-prices against the Sheet
// regardless, so a stale price can be displayed but never charged.
// ============================================================

import { cache } from 'react';
import type { Product } from '@/types';
import { mapApiProduct } from './api';
import { dataWorker, toApiProduct, type ShippingZone } from './data-worker';
import { DEFAULT_ZONES } from './constants';
import fallbackProducts from '@/data/products.json';

const FALLBACK = fallbackProducts as Product[];

/** Reuse a read for this long within one isolate. */
const MEMORY_MS = 5_000;

export interface Storefront {
  products: Product[];
  zones: ShippingZone[];
  /** False when this is the last good copy or the bundled snapshot. */
  live: boolean;
}

let memory: (Storefront & { at: number }) | null = null;

async function readStorefront(): Promise<Storefront> {
  if (memory && Date.now() - memory.at < MEMORY_MS) return memory;

  const data = await dataWorker();
  if (data) {
    try {
      const c = await data.catalog();
      const products = c.products
        .filter((p) => p && p.sku)
        .map((p) => mapApiProduct(toApiProduct(p)))
        .filter((p) => p.status !== 'Hidden');
      if (products.length) {
        memory = { products, zones: c.zones.length ? c.zones : DEFAULT_ZONES, live: true, at: Date.now() };
        return memory;
      }
    } catch (err) {
      console.warn('[Waraqa] Data Worker catalog read failed, using last good copy:', err);
    }
  }
  if (memory) return { ...memory, live: false };
  return { products: FALLBACK, zones: DEFAULT_ZONES, live: false };
}

/** Products and shipping zones for a server component, shared within one request. */
export const getStorefront = cache(readStorefront);

/** Just the products (what most pages need). */
export const getCatalog = cache(async (): Promise<Product[]> => (await getStorefront()).products);
