// ============================================================
// Waraqa Store — Numbers, prices and product facts per locale
// ============================================================
// Arabic copy uses Arabic-Indic digits and English copy Western digits with
// the currency first: «٢٢٠ ج.م» / "EGP 220" (BRAND_GUIDELINES.md §4). The
// digits are swapped by hand rather than through Intl so the Worker and the
// browser always produce the same string: their ICU data can differ, and a
// mismatch surfaces as a hydration error.
//
// Display only. Arithmetic, order payloads and JSON-LD keep raw numbers
// (lib/money.ts).
// ============================================================

import type { Locale } from './translations';
import { formatAmount, round2 } from './money';

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** A numeral in the locale's digits; the decimal point becomes «٫» in Arabic. */
function localDigits(numeral: string, locale: Locale): string {
  if (locale !== 'ar') return numeral;
  return numeral.replace(/[0-9.]/g, (c) => (c === '.' ? '٫' : ARABIC_DIGITS[Number(c)]));
}

/** A count or measurement: 40 → «٤٠», 10.5 → «١٠٫٥». `minDigits` pads: 1 → «٠١». */
export function formatNumber(n: number, locale: Locale, minDigits = 1): string {
  return localDigits(String(round2(n)).padStart(minDigits, '0'), locale);
}

const CURRENCY_LABEL: Record<Locale, string> = { en: 'EGP', ar: 'ج.م' };

export function currencyLabel(locale: Locale): string {
  return CURRENCY_LABEL[locale];
}

/** A price amount without the currency, e.g. a struck-through old price. */
export function formatPriceAmount(n: number, locale: Locale): string {
  return localDigits(formatAmount(n), locale);
}

/**
 * "EGP 220" / «٢٢٠ ج.م», for running text, joined by a no-break space since
 * a plain string cannot be styled nowrap. On a page, prefer <Price>.
 */
export function formatPrice(n: number, locale: Locale): string {
  const amount = formatPriceAmount(n, locale);
  return locale === 'ar' ? `${amount}\u00A0${CURRENCY_LABEL.ar}` : `${CURRENCY_LABEL.en}\u00A0${amount}`;
}

/**
 * Joins facts on one line: "Mixed Media · 200gsm" / «ميكسد ميديا، ٢٠٠ جرام».
 * Arabic takes a comma: in Readex Pro the zero «٠» is a dot, so a "·" beside
 * an Arabic-Indic number read as one more zero («٢٠٠ ·» as ٢٠٠٠).
 */
export function factSeparator(locale: Locale): string {
  return locale === 'ar' ? '، ' : ' · ';
}

/** Joins the two ends of a range. Word joiners stop "3–7" breaking after the dash. */
export const RANGE_DASH = '\u2060–\u2060';

/** "3–7" / «٣–٧», never split across lines. */
export function formatRange(from: number, to: number, locale: Locale): string {
  return `${formatNumber(from, locale)}${RANGE_DASH}${formatNumber(to, locale)}`;
}

export interface PluralForms {
  zero?: string;
  one: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

function pluralCategory(locale: Locale, n: number): keyof PluralForms {
  if (locale !== 'ar') return n === 1 ? 'one' : 'other';
  if (!Number.isInteger(n)) return 'other';
  const lastTwo = n % 100;
  if (n === 0) return 'zero';
  if (n === 1) return 'one';
  if (n === 2) return 'two';
  if (lastTwo >= 3 && lastTwo <= 10) return 'few';
  if (lastTwo >= 11) return 'many';
  return 'other';
}

/**
 * The form of a phrase that fits a count, with the count in it:
 * plural('ar', 3, { one: 'منتج واحد', two: 'منتجين', few: '{n} منتجات', other: '{n} منتج' })
 * → «٣ منتجات». Arabic follows the CLDR categories (0 zero, 1 one, 2 two, then
 * by the last two digits: 3–10 few, 11–99 many, otherwise other); English is
 * one/other. A form that is not given falls back to `other`.
 */
export function plural(locale: Locale, n: number, forms: PluralForms): string {
  return (forms[pluralCategory(locale, n)] ?? forms.other).replace('{n}', formatNumber(n, locale));
}

const MEASUREMENT = /(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)/i;

/**
 * A size for display. A5 and A4 are paper-size names and stay as they are;
 * a measurement gets its unit in the reader's language, after a no-break
 * space: "25×35cm" → "25×35 cm" / «٢٥×٣٥ سم», "Mini (10.5×15)" →
 * "Mini 10.5×15 cm" / «ميني ١٠٫٥×١٥ سم». Any other value from the Sheet is
 * shown as typed.
 */
export function sizeLabel(size: string, locale: Locale): string {
  const raw = String(size || '').trim();
  const m = raw.match(MEASUREMENT);
  if (!m || raw.replace(MEASUREMENT, '').replace(/mini|cm|[()\s]/gi, '')) return raw;
  const dims = `${formatNumber(Number(m[1]), locale)}×${formatNumber(Number(m[2]), locale)}`;
  const mini = /mini/i.test(raw);
  return locale === 'ar' ? `${mini ? 'ميني ' : ''}${dims}\u00A0سم` : `${mini ? 'Mini ' : ''}${dims}\u00A0cm`;
}

// Keyed by the Sheet's English value, lower-cased.
const PAPER_TYPES_AR: Record<string, string> = {
  kraft: 'كرافت',
  'mixed media': 'ميكسد ميديا',
  drawing: 'رسم',
  'dry media': 'خامات جافة',
};

/** The Sheet's paper type in the reader's language; one we have no name for is shown as typed. */
export function paperTypeLabel(type: string, locale: Locale): string {
  const raw = String(type || '').trim();
  if (locale !== 'ar') return raw;
  return PAPER_TYPES_AR[raw.toLowerCase()] ?? raw;
}

/**
 * Keeps a phone number, email or link in one left-to-right run inside Arabic
 * text (LRI … PDI). Unisolated, "+201…" rendered as "201…+".
 */
export function ltr(text: string): string {
  return `\u2066${text}\u2069`;
}
