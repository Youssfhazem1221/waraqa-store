// ============================================================
// Shipping amounts in page copy, from the live zones.
// ============================================================
// Rates are edited in the CRM (the Sheet's Shipping tab), so no sentence may
// carry a typed-in fee: the policy page, the FAQ and its FAQPage markup, the
// bag notes and the product JSON-LD all said 60/75/800 while checkout charged
// whatever the Sheet said.
//
// Copy in translations.ts keeps its wording and marks the amounts with
// {homeFee}, {restFee} and {freeOver}. The wording assumes today's shape:
// one home zone (Cairo & Giza) that can ship free, and everywhere else. If the
// zones are ever restructured (a third zone, or no free threshold), reword
// those sentences. The policy page and the JSON-LD list every zone and need
// no rewording.
// ============================================================

import { GOVERNORATES, type ShippingZone } from './constants';
import { GOVERNORATES_AR, type Locale } from './translations';
import { formatNumber, formatPrice } from './format';

export interface HomeRates {
  /** Fee in the home zone (the one with Cairo). */
  homeFee: number;
  /** Fee everywhere else (the `*` zone). */
  restFee: number;
  /** Home-zone subtotal for free delivery; 0 = never free. */
  freeOver: number;
}

function homeZone(zones: ShippingZone[]): ShippingZone | undefined {
  return (
    zones.find((z) => z.governorates.includes('cairo') || z.governorates.includes('القاهرة')) ??
    zones.find((z) => !z.governorates.includes('*'))
  );
}

export function restZone(zones: ShippingZone[]): ShippingZone | undefined {
  return zones.find((z) => z.governorates.includes('*'));
}

export function homeRates(zones: ShippingZone[]): HomeRates {
  const home = homeZone(zones);
  const rest = restZone(zones) ?? home;
  return { homeFee: home?.fee ?? 0, restFee: rest?.fee ?? 0, freeOver: home?.freeOver ?? 0 };
}

/** Replace {homeFee} / {restFee} / {freeOver} with formatted prices ("EGP 60" / «٦٠ ج.م»). */
export function fillRates(text: string, rates: HomeRates, locale: Locale): string {
  return text.replace(/\{(homeFee|restFee|freeOver)\}/g, (_, k: keyof HomeRates) => formatPrice(rates[k], locale));
}

/** Same, for every question and answer of an FAQ list. */
export function fillRatesInFaq<T extends { q: string; a: string }>(items: T[], rates: HomeRates, locale: Locale): T[] {
  return items.map((it) => ({ ...it, q: fillRates(it.q, rates, locale), a: fillRates(it.a, rates, locale) }));
}

const ENGLISH_BY_LOWER = new Map<string, string>(GOVERNORATES.map((g) => [g.toLowerCase(), g]));
const ENGLISH_BY_ARABIC = new Map<string, string>(Object.entries(GOVERNORATES_AR).map(([en, ar]) => [ar, en]));

/**
 * A zone's governorates as canonical English names ("Cairo", "Giza"), in the
 * order the zone lists them. The Sheet keeps them lower-case and may list a
 * governorate in English and Arabic both; each is named once.
 */
export function zoneGovernorates(zone: ShippingZone): string[] {
  const out: string[] = [];
  for (const g of zone.governorates) {
    const en = ENGLISH_BY_LOWER.get(g) ?? ENGLISH_BY_ARABIC.get(g);
    if (en && !out.includes(en)) out.push(en);
  }
  return out;
}

/** "Cairo and Giza" / "A, B and C" — «القاهرة والجيزة» / «أ، ب وج». */
export function joinGovernorates(names: string[], locale: Locale): string {
  const local = locale === 'ar' ? names.map((n) => GOVERNORATES_AR[n] ?? n) : names;
  if (local.length <= 1) return local[0] ?? '';
  const head = local.slice(0, -1).join(locale === 'ar' ? '، ' : ', ');
  const last = local[local.length - 1];
  return locale === 'ar' ? `${head} و${last}` : `${head} and ${last}`;
}

/** An amount in the legal pages' formal Arabic («٦٠ جنيه») or in English ("EGP 60"). */
function legalAmount(n: number, locale: Locale): string {
  return locale === 'ar' ? `${formatNumber(n, 'ar')} جنيه` : formatPrice(n, 'en');
}

/**
 * The fee bullets of the shipping policy, one per zone and one per free
 * threshold. With today's two zones this is word for word the text the policy
 * page has always shown.
 */
export function feeBullets(zones: ShippingZone[], locale: Locale): string[] {
  const ar = locale === 'ar';
  const named = zones.filter((z) => !z.governorates.includes('*') && zoneGovernorates(z).length);
  const rest = restZone(zones);
  const out: string[] = [];

  for (const z of named) {
    const where = joinGovernorates(zoneGovernorates(z), locale);
    out.push(ar ? `• ${where}: ${legalAmount(z.fee, locale)}.` : `• ${where}: ${legalAmount(z.fee, locale)}.`);
  }
  if (rest) {
    out.push(ar ? `• باقي المحافظات: ${legalAmount(rest.fee, locale)}.` : `• All other governorates: ${legalAmount(rest.fee, locale)}.`);
  }

  for (const z of named.filter((z) => z.freeOver > 0)) {
    const where = joinGovernorates(zoneGovernorates(z), locale);
    const always = rest && !(rest.freeOver > 0);
    out.push(
      ar
        ? `• التوصيل مجاني في ${where} للطلبات التي تبلغ قيمتها ${legalAmount(z.freeOver, locale)} أو أكثر.${always ? ' تُحتسب مصاريف التوصيل دائمًا في باقي المحافظات.' : ''}`
        : `• Free delivery in ${where} on orders of ${legalAmount(z.freeOver, locale)} or more.${always ? ' Other governorates always pay the delivery fee.' : ''}`
    );
  }
  if (rest && rest.freeOver > 0) {
    out.push(
      ar
        ? `• التوصيل مجاني في باقي المحافظات للطلبات التي تبلغ قيمتها ${legalAmount(rest.freeOver, locale)} أو أكثر.`
        : `• Free delivery to all other governorates on orders of ${legalAmount(rest.freeOver, locale)} or more.`
    );
  }
  return out;
}
