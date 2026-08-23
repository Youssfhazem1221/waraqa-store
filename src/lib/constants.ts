// ============================================================
// Waraqa Store — Constants & Configuration
// ============================================================

/**
 * Read a numeric env var. Uses the fallback only when the value is absent or
 * unparseable — NOT when it is a legitimate 0. `Number(x) || fallback` would
 * turn an intentional "free delivery for everyone" (SHIPPING_CAIRO=0) back
 * into the default fee.
 */
function numEnv(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === '') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

/** Google Apps Script Web App URL for dynamic data & order placement */
export const WEB_APP_URL =
  process.env.NEXT_PUBLIC_WEB_APP_URL ||
  'https://script.google.com/macros/s/AKfycbyeMKSS9OBDWPyoyNYLDeauHlL5K9atQSvpFEdTJRfwwEdefRltToOmHbbps3jZxlY/exec';

/** Owner's WhatsApp number in international format (Egypt +20) */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201069237525';

export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || 'EGP';

// ---- Shipping ------------------------------------------------------
// Two zones, because the courier charges differently for them:
//   Cairo + Giza  → SHIPPING_CAIRO
//   everywhere else → SHIPPING_OUTSIDE
// Free shipping over FREE_SHIP_OVER applies to the Cairo zone ONLY; outside it
// the fee is always charged.
//
// Consequence worth knowing: the fee now depends on the delivery address, which
// is not known until checkout. Anything rendered before then (the bag, the
// announcement bar) must show a range or a "from" figure — never a single
// number it might have to walk back. quoteShipping() encodes that distinction
// in its `exact` flag so a caller cannot accidentally present an estimate as
// final.

/** Delivery fee inside the Cairo zone (EGP). */
export const SHIPPING_CAIRO = numEnv(process.env.NEXT_PUBLIC_SHIPPING_CAIRO, 60);

/** Delivery fee everywhere else in Egypt (EGP). */
export const SHIPPING_OUTSIDE = numEnv(process.env.NEXT_PUBLIC_SHIPPING_OUTSIDE, 75);

/** Subtotal at which Cairo-zone delivery becomes free (EGP). */
export const FREE_SHIP_OVER = numEnv(process.env.NEXT_PUBLIC_FREE_SHIP_OVER, 800);

/**
 * Governorates on the Cairo rate.
 * Must match CAIRO_ZONE in waraqa-apps-script.gs — the storefront quotes the
 * fee, the Apps Script decides it.
 */
export const CAIRO_ZONE_GOVERNORATES = ['Cairo', 'Giza'] as const;

/** Business-day delivery window quoted to customers. */
export const DELIVERY_DAYS_MIN = 3;
export const DELIVERY_DAYS_MAX = 7;

/** Is this governorate on the Cairo rate? Tolerates casing/spacing noise. */
export function isCairoZone(governorate: string): boolean {
  const g = String(governorate || '').trim().toLowerCase();
  if (!g) return false;
  return CAIRO_ZONE_GOVERNORATES.some((z) => z.toLowerCase() === g);
}

export interface ShippingQuote {
  /** The fee to charge, or the low end of the range when not yet exact. */
  amount: number;
  /** True once the delivery address is known and this is the final fee. */
  exact: boolean;
  /** Cheapest and dearest possible fee — equal to `amount` when exact. */
  low: number;
  high: number;
  /** Is delivery free at this subtotal for this address? */
  free: boolean;
}

/**
 * Price delivery for a subtotal and (optionally) a governorate.
 *
 * With no governorate the result spans both zones, so the UI can say
 * "60–75 EGP" instead of committing to a number that changes at checkout.
 */
export function quoteShipping(subtotal: number, governorate?: string): ShippingQuote {
  const qualifies = subtotal >= FREE_SHIP_OVER;

  if (governorate && governorate.trim()) {
    const fee = isCairoZone(governorate)
      ? qualifies
        ? 0
        : SHIPPING_CAIRO
      : SHIPPING_OUTSIDE;
    return { amount: fee, exact: true, low: fee, high: fee, free: fee === 0 };
  }

  // Address unknown. Cairo is the cheap end (possibly free), outside Cairo the
  // dear end — and the dear end is never free, so a big order still shows a
  // range rather than a bare "FREE" that later becomes 75.
  const low = qualifies ? 0 : SHIPPING_CAIRO;
  const high = SHIPPING_OUTSIDE;
  return { amount: low, exact: false, low, high, free: false };
}

/** The delivery fee alone. Prefer quoteShipping() where the UI must show it. */
export function shippingFor(subtotal: number, governorate?: string): number {
  return quoteShipping(subtotal, governorate).amount;
}

/** How long a fetched catalog stays fresh before we re-ask the Sheet (ms). */
export const CATALOG_TTL_MS = 5 * 60 * 1000;

/** Give up on the Apps Script backend after this long (ms). Apps Script cold
 *  starts are slow, so this is generous — but not unbounded, which would hang
 *  the page forever on a dead deployment. */
export const CATALOG_TIMEOUT_MS = 10_000;
export const ORDER_TIMEOUT_MS = 20_000;

/** Egyptian governorates for checkout dropdown */
export const GOVERNORATES = [
  'Cairo',
  'Giza',
  'Alexandria',
  'Qalyubia',
  'Dakahlia',
  'Sharqia',
  'Gharbia',
  'Monufia',
  'Beheira',
  'Kafr El Sheikh',
  'Damietta',
  'Port Said',
  'Ismailia',
  'Suez',
  'North Sinai',
  'South Sinai',
  'Beni Suef',
  'Fayoum',
  'Minya',
  'Asyut',
  'Sohag',
  'Qena',
  'Luxor',
  'Aswan',
  'Red Sea',
  'New Valley',
  'Matrouh',
] as const;

/** Product size options for filters */
export const SIZE_OPTIONS = ['All', 'A5', 'Mini (10.5×15)', '25×35cm', '25×25cm', 'A4'] as const;

/** Sort options for the shop */
export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A–Z' },
] as const;

/** Brand copy */
export const BRAND = {
  name: 'Waraqa',
  nameAr: 'ورقة',
  tagline: 'Fill the blank page.',
  taglineAr: 'اكتب. ارسم. تخيّل.',
  description:
    'Waraqa (ورقة) is the blank page and the living leaf at once. Sketchbooks and paper goods — warm, hand-made, and quietly confident.',
  story:
    'Waraqa (ورقة) is the blank page and the living leaf at once. The mark keeps that duality: bold, rounded Kufi letterforms that feel drawn by hand, sitting like ink pressed into a fresh sheet. Everything in this system — the earthy palette, the paper surfaces, the unhurried type — points back to that feeling: a good sketchbook, waiting to be filled.',
} as const;

/** Trust row items */
export const TRUST_ITEMS = [
  {
    icon: 'truck' as const,
    title: 'Free Shipping',
    description: `In Cairo & Giza on orders over ${FREE_SHIP_OVER} ${CURRENCY}`,
  },
  {
    icon: 'leaf' as const,
    title: 'Eco-Friendly',
    description: 'Acid-free, sustainable paper',
  },
  {
    icon: 'shield' as const,
    title: 'Secure Orders',
    description: 'Cash on delivery, confirmed by email',
  },
] as const;
