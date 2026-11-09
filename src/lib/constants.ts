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

/** Owner's WhatsApp number in international format (Egypt +20) */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201069237525';

/** Social profile URLs for sameAs and link elements */
export const INSTAGRAM_URL = 'https://www.instagram.com/waraqastore.1/';

/** Public contact address shown on the legal pages. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'youssf.hazem1221@gmail.com';

/**
 * Seller registration details. The Consumer Protection Law (Art. 37) requires
 * online sellers to show their commercial registration and tax card numbers;
 * each line only renders once its value is set.
 */
export const COMMERCIAL_REGISTRATION = process.env.NEXT_PUBLIC_COMMERCIAL_REGISTRATION || '';
export const TAX_CARD_NUMBER = process.env.NEXT_PUBLIC_TAX_CARD_NUMBER || '';

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

/**
 * Longest value each checkout field accepts. Must match FIELD_MAX in
 * waraqa-apps-script.gs, which rejects anything longer — the inputs cap typing
 * here so a real customer can never hit that rejection.
 */
export const FIELD_MAX = {
  name: 100,
  phone: 20,
  email: 254,
  city: 80,
  address: 300,
  notes: 1000,
} as const;

/**
 * Most copies of one book a single order may hold. Must match MAX_LINE_QTY in
 * waraqa-apps-script.gs, which refuses the whole order above it; the bag used
 * to allow 99.
 */
export const MAX_LINE_QTY = 50;

/** Business-day delivery window quoted to customers. */
export const DELIVERY_DAYS_MIN = 3;
export const DELIVERY_DAYS_MAX = 7;

/**
 * Live shipping zones come from the Sheet's Shipping tab (edited in the CRM)
 * and reach the browser through ShippingContext. These are today's rates,
 * used only until that arrives or if the data Worker is unreachable. The
 * order endpoint prices shipping itself, so these never decide a charge.
 */
export interface ShippingZone {
  zone: string;
  /** Lower-case governorate names, English and Arabic. `*` = everywhere else. */
  governorates: string[];
  fee: number;
  /** Subtotal at which this zone ships free; 0 = never. */
  freeOver: number;
}

export const DEFAULT_ZONES: ShippingZone[] = [
  {
    zone: 'Cairo & Giza',
    governorates: [...CAIRO_ZONE_GOVERNORATES.map((g) => g.toLowerCase()), 'القاهرة', 'الجيزة'],
    fee: SHIPPING_CAIRO,
    freeOver: FREE_SHIP_OVER,
  },
  { zone: 'Rest of Egypt', governorates: ['*'], fee: SHIPPING_OUTSIDE, freeOver: 0 },
];

/** The zone for a governorate: an explicit match first, then the `*` zone. Same rule as the data Worker. */
export function zoneFor(zones: ShippingZone[], governorate: string): ShippingZone | null {
  const g = String(governorate || '').split('·')[0].split(',')[0].trim().toLowerCase();
  if (g) {
    const hit = zones.find((z) => z.governorates.includes(g));
    if (hit) return hit;
  }
  return zones.find((z) => z.governorates.includes('*')) ?? zones[zones.length - 1] ?? null;
}

function feeIn(zone: ShippingZone, subtotal: number): number {
  return zone.freeOver > 0 && subtotal >= zone.freeOver ? 0 : zone.fee;
}

/** Lowest subtotal that ships free anywhere, or 0 if no zone ever ships free. */
export function freeShipOver(zones: ShippingZone[]): number {
  const t = zones.map((z) => z.freeOver).filter((n) => n > 0);
  return t.length ? Math.min(...t) : 0;
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
 * With no governorate the result spans every zone, so the UI can say
 * "60–75 EGP" instead of committing to a number that changes at checkout. The
 * range is never a bare "free" unless every zone ships free at this subtotal.
 */
export function quoteShipping(
  subtotal: number,
  governorate?: string,
  zones: ShippingZone[] = DEFAULT_ZONES
): ShippingQuote {
  if (governorate && governorate.trim()) {
    const z = zoneFor(zones, governorate);
    const fee = z ? feeIn(z, subtotal) : 0;
    return { amount: fee, exact: true, low: fee, high: fee, free: fee === 0 };
  }
  const fees = zones.map((z) => feeIn(z, subtotal));
  const low = fees.length ? Math.min(...fees) : 0;
  const high = fees.length ? Math.max(...fees) : 0;
  return { amount: low, exact: false, low, high, free: high === 0 };
}

/** How long a catalog read in the browser is reused (ms). */
export const CATALOG_TTL_MS = 30 * 1000;

/** Browser read of /api/catalog. The data Worker answers from memory. */
export const CATALOG_TIMEOUT_MS = 10_000;

/** Placing an order: written, re-priced and stock-checked under the data
 *  Worker's lock. Usually a second or two; generous so a slow Sheets API call
 *  never shows "try again" for an order that went through. */
export const ORDER_TIMEOUT_MS = 30_000;

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
export const SIZE_OPTIONS = ['All', 'A5', 'Mini (10.5×15)', '25×35cm', 'A4'] as const;

/** The shop's size filter in the URL (/shop?size=a5); All has none. */
export const SIZE_SLUGS: Record<string, string> = {
  A5: 'a5',
  'Mini (10.5×15)': 'mini',
  '25×35cm': '25x35',
  A4: 'a4',
};

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
    'Waraqa (ورقة) is the blank page and the living leaf at once. Sketchbooks and paper goods: warm, hand-made, and quietly confident.',
  story:
    'Waraqa (ورقة) is the blank page and the living leaf at once. The mark keeps that duality: bold, rounded Kufi letterforms that feel drawn by hand, sitting like ink pressed into a fresh sheet. Everything in this system (the earthy palette, the paper surfaces, the unhurried type) points back to that feeling: a good sketchbook, waiting to be filled.',
} as const;

/** Trust row items */
export const TRUST_ITEMS = [
  {
    icon: 'truck' as const,
    title: 'Free Shipping',
    description: `In Cairo & Giza on orders from ${CURRENCY} ${FREE_SHIP_OVER}`,
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
