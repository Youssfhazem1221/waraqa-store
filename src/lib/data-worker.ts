// ============================================================
// The store's line to the waraqa-data Worker (service binding DATA, PublicApi
// entrypoint). It replaced the Apps Script Web App: reads come from the data
// Worker's in-memory copy of the Sheet (milliseconds, not 2–35 s), and orders
// are written under the same lock the CRM's edits use.
//
// Server-only. The browser reaches it through /api/catalog, /api/order and
// /api/subscribe.
// ============================================================

import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { ApiProduct } from '@/types';

/** Shipping zone as the data Worker publishes it (no courier cost). */
export interface ShippingZone {
  zone: string;
  /** Lower-case governorate names, English and Arabic. `*` = everywhere else. */
  governorates: string[];
  fee: number;
  /** Subtotal at which this zone ships free; 0 = never. */
  freeOver: number;
}

interface PublicProduct {
  sku: string;
  nameEn: string;
  nameAr: string;
  category: string;
  size: string;
  sheets: number;
  gsm: number;
  paperType: string;
  price: number;
  compareAt: number;
  stock: number;
  status: string;
  image: string;
  descriptionEn: string;
  descriptionAr: string;
  featured: boolean;
}

export interface DataCatalog {
  products: PublicProduct[];
  zones: ShippingZone[];
  supportWhatsapp: string;
  readAt: number;
}

export interface OrderRequest {
  customer: { name: string; phone: string; email: string; governorate: string; city?: string; address: string };
  items: { sku: string; qty: number }[];
  notes?: string;
  lang?: 'en' | 'ar';
}

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

export interface PublicApi {
  catalog(): Promise<DataCatalog>;
  createOrder(req: OrderRequest): Promise<Result<{ orderId: string; subtotal: number; shipping: number; total: number }>>;
  subscribe(email: string, locale: string, source: string): Promise<Result<{ alreadySubscribed?: boolean }>>;
}

/** The binding, or null outside Cloudflare (build-time prerender, plain `next start`). */
export async function dataWorker(): Promise<PublicApi | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return ((env as unknown as { DATA?: PublicApi }).DATA) ?? null;
  } catch {
    return null;
  }
}

/** The data Worker's product shape -> the one the store has always used. */
export function toApiProduct(p: PublicProduct): ApiProduct {
  return {
    sku: p.sku,
    name: p.nameEn,
    nameAr: p.nameAr,
    category: p.category,
    size: p.size,
    sheets: p.sheets,
    gsm: p.gsm,
    paperType: p.paperType,
    price: p.price,
    compareAt: p.compareAt,
    stock: p.stock,
    status: p.status,
    image: p.image,
    description: p.descriptionEn,
    descriptionAr: p.descriptionAr,
    featured: p.featured,
  };
}
