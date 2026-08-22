// ============================================================
// Waraqa Store — Constants & Configuration
// ============================================================

/** Google Apps Script Web App URL for dynamic data & order placement */
export const WEB_APP_URL =
  process.env.NEXT_PUBLIC_WEB_APP_URL ||
  'https://script.google.com/macros/s/AKfycbz7sJWx7ntjg4E1J6mIb6yYsaD1l3XlSOdEKc9HGc4pdxKqqvunQeVJrCu_F0YwZyZ5/exec';

/** Owner's WhatsApp number in international format (Egypt +20) */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201069237525';

/** Shipping configuration */
export const SHIPPING_FLAT = Number(process.env.NEXT_PUBLIC_SHIPPING_FLAT) || 50;
export const FREE_SHIP_OVER = Number(process.env.NEXT_PUBLIC_FREE_SHIP_OVER) || 800;
export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || 'EGP';

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
    description: `On orders over ${FREE_SHIP_OVER} ${CURRENCY}`,
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
