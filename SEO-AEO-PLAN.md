# Waraqa Store — SEO & AEO Implementation Plan

**Audience:** an AI coding agent executing this end to end.
**Repo root for every path below:** `C:\Users\Youssf\Documents\WaraqaStore\waraqa-store`
**Stack:** Next.js 16.3.1 (App Router, `src/` dir), React 19, Tailwind v4, TypeScript.

---

## 0. How to use this document

**Do not re-audit the codebase.** Every fact you need is in §1. Do not grep for the
current state of i18n, metadata, or schema — it is already recorded below.

**Rules of execution:**

1. Work phase by phase, in order. Phases 1→2 are independent of 3→4; **Phase 3 is the
   only one that moves files**, so finish 1 and 2 first and commit them.
2. After each phase, run `npm run build` **once**. Do not run `npm run dev` in a loop.
3. Do not reformat, restyle, or "improve" code you were not told to touch. This repo has
   dense explanatory comments on non-obvious decisions — preserve them verbatim when
   moving a file.
4. Match the existing comment style: explain *why*, not *what*, and only where a reader
   would otherwise be puzzled.
5. Tick the checkboxes in this file as you complete them. Commit after each phase with
   the message given at the end of the phase.
6. If a step's premise turns out to be false (file missing, code already changed), stop
   and report it — do not improvise a different design.

**Definition of done:** `npm run build` passes, `/en` and `/ar` both render server-side
with correct `lang`/`dir`, `/sitemap.xml` lists 20 URLs, and every page emits valid
JSON-LD.

---

## 1. Ground truth — current state (verified, do not re-check)

### File inventory (only what matters here)

```
src/app/layout.tsx                    root layout, hardcodes lang="en"
src/app/page.tsx                      'use client'  — home
src/app/shop/page.tsx                 'use client'  — shop
src/app/about/page.tsx                'use client'  — about
src/app/cart/page.tsx                 'use client'
src/app/checkout/page.tsx             'use client'
src/app/confirmation/page.tsx         'use client'
src/app/not-found.tsx
src/app/product/[slug]/page.tsx       server component, ISR (revalidate = 300)
src/app/globals.css
src/app/favicon.ico
src/context/LanguageContext.tsx       locale from localStorage, client-only
src/components/ui/LanguageToggle.tsx  calls setLocale()
src/lib/translations.ts               562 lines, full en + ar trees
src/lib/constants.ts                  BRAND, shipping, GOVERNORATES, TRUST_ITEMS
src/lib/seo.ts                        DOES NOT EXIST — you will create it
src/data/products.json                8 products
src/types/index.ts                    Product, ApiProduct, CartItem, ...
```

**Absent:** `src/app/sitemap.ts`, `src/app/robots.ts`, `src/middleware.ts`,
`public/robots.txt`, any `hreflang`, any `alternates.languages`.

### The five defects this plan fixes

| # | Defect | Evidence |
|---|--------|----------|
| 1 | Arabic has no URL. Locale lives in `localStorage`; `useStoredValue` returns `null` on the server, so **every SSR response is English**. `dir`/`lang` are patched in a `useEffect` after mount. | `src/context/LanguageContext.tsx` |
| 2 | No sitemap, no robots. | absent |
| 3 | `/`, `/shop`, `/about` are `'use client'` → cannot export `metadata`; all three inherit the generic homepage title. | the three `page.tsx` files |
| 4 | Domain mismatch: `metadataBase` falls back to `waraqa-store.vercel.app`, `openGraph.url` is hardcoded `https://waraqa.store`. | `src/app/layout.tsx:32` and `:59` |
| 5 | Only one JSON-LD block in the whole app (Product/Offer on the product page). No Organization, WebSite, BreadcrumbList, ItemList, or FAQPage. | `src/app/product/[slug]/page.tsx:97` |

### Data shape facts

- `Product` (`src/types/index.ts`) has `name`, `nameAr`, `description`. **There is no
  `descriptionAr` field and no Arabic description anywhere.** Phase 4 adds it.
- The 8 slugs, in file order:
  `a5-mixed-media-sketchbook-320gsm`, `a5-kraft-sketchbook-180gsm`,
  `a5-drawing-sketchbook-150gsm`, `a5-sketchbook-250gsm`, `mini-sketchbook-200gsm`,
  `large-sketchbook-25x35-150gsm`, `square-sketchbook-25x25-250gsm`,
  `a4-mixed-media-sketchbook-320gsm`.
- `translations.ts` exports `translations` with identical `en` and `ar` trees, sections:
  `common, nav, announcement, hero, featured, story, trust, newsletter, shop, product,
  cart, checkout, confirmation, about, footer`. It also exports `type Locale = 'en' | 'ar'`.
- Currency is EGP. Market is Egypt. Payment is cash on delivery.
- `src/lib/constants.ts` exports `BRAND` (`name`, `nameAr`, `tagline`, `taglineAr`,
  `description`, `story`) and `WHATSAPP_NUMBER`.

### Two standing repo constraints (from prior sessions)

- **`waraqa-apps-script.gs` is inert until manually redeployed.** Editing it locally
  changes nothing. If a phase touches it, say so explicitly in your final report — the
  user must paste it into the Apps Script editor and redeploy.
- **Shipping config is duplicated** between `.env.local` and the Apps Script and must be
  changed together. No phase here touches shipping; do not.

---

## 2. Target architecture

URL-based locale routing, English and Arabic both prefixed:

```
/en, /en/shop, /en/about, /en/product/<slug>
/ar, /ar/shop, /ar/about, /ar/product/<slug>
```

A bare path (`/`, `/shop`) is redirected by middleware to the visitor's locale, chosen
from the `NEXT_LOCALE` cookie, then `Accept-Language`, then `en`.

`src/app/[locale]/layout.tsx` becomes the **root layout** (it owns `<html>`/`<body>`) and
`src/app/layout.tsx` is deleted. This is the pattern Next.js documents for i18n. Metadata
routes (`sitemap.ts`, `robots.ts`) stay at `src/app/` — they need no layout.

Language state stops being a stored preference and becomes a URL fact. `localStorage` is
replaced by the `NEXT_LOCALE` cookie, read by middleware, written by the toggle.

---

## Phase 1 — Foundations (no file moves, ~1 hour)

Safe to ship alone. Everything here survives Phase 3 unchanged.

### 1.1 Add the site URL to env

- [ ] Append to `.env.local` **and** `.env.example`:

```bash
# Canonical production origin. Used for metadataBase, canonical URLs, sitemap
# and robots. No trailing slash. Env changes need a dev-server restart.
NEXT_PUBLIC_SITE_URL=https://waraqastore.vercel.app
```

If the real production domain is not `waraqa.store`, use the real one and say so in your
report. Do not leave two different hosts in the codebase — that is defect #4.

### 1.2 Create `src/lib/seo.ts`

- [ ] New file, exactly:

```ts
// ============================================================
// Waraqa Store — SEO helpers (canonical origin, locale URLs, hreflang)
// ============================================================

import type { Locale } from '@/lib/translations';

/**
 * Canonical origin for every absolute URL the site emits.
 *
 * Previously `metadataBase` and `openGraph.url` disagreed (a vercel.app fallback
 * against a hardcoded waraqa.store), which makes canonical and OG URLs resolve to
 * different hosts. One value, one source.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://waraqastore.vercel.app'
).replace(/\/+$/, '');

export const LOCALES = ['en', 'ar'] as const;
export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string | undefined): value is Locale {
  return value === 'en' || value === 'ar';
}

/** `/ar` + `/shop` → `/ar/shop`; `/ar` + `/` → `/ar`. */
export function localePath(locale: Locale, path: string = '/'): string {
  const clean = path === '/' ? '' : `/${path.replace(/^\/+|\/+$/g, '')}`;
  return `/${locale}${clean}`;
}

export function absoluteUrl(locale: Locale, path: string = '/'): string {
  return `${SITE_URL}${localePath(locale, path)}`;
}

/**
 * Canonical + hreflang for one page. `x-default` points at English because that
 * is what an unknown-locale visitor gets from the middleware.
 */
export function seoAlternates(locale: Locale, path: string = '/') {
  return {
    canonical: localePath(locale, path),
    languages: {
      en: localePath('en', path),
      ar: localePath('ar', path),
      'x-default': localePath('en', path),
    },
  };
}

/** OpenGraph locale tags — `ar_EG` because the store ships only inside Egypt. */
export function ogLocale(locale: Locale) {
  return {
    locale: locale === 'ar' ? 'ar_EG' : 'en_US',
    alternateLocale: locale === 'ar' ? 'en_US' : 'ar_EG',
  };
}
```

### 1.3 Create `src/app/robots.ts`

- [ ] New file:

```ts
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Transactional routes hold no indexable content and would only spend
        // crawl budget — and a cached /confirmation could leak an order state.
        disallow: [
          '/en/cart',
          '/ar/cart',
          '/en/checkout',
          '/ar/checkout',
          '/en/confirmation',
          '/ar/confirmation',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

### 1.4 Create `src/app/sitemap.ts`

- [ ] New file. Emits both locales for all route shapes with reciprocal hreflang
      (10 paths × 2 locales = 20 URLs):

```ts
import type { MetadataRoute } from 'next';
import type { Product } from '@/types';
import productsData from '@/data/products.json';
import { SITE_URL, LOCALES } from '@/lib/seo';

const products = productsData as Product[];

/**
 * Built from the bundled catalog rather than the live Apps Script feed: a sitemap
 * must be generated deterministically at build time, and the slug set only changes
 * on deploy. Prices and stock are not sitemap data.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths: {
    path: string;
    priority: number;
    changeFrequency: 'weekly' | 'monthly';
  }[] = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/shop', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
    ...products.map((p) => ({
      path: `/product/${p.slug}`,
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    })),
  ];

  const lastModified = new Date();

  return paths.flatMap(({ path, priority, changeFrequency }) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`])
        ),
      },
    }))
  );
}
```

### 1.5 Unify the domain in `src/app/layout.tsx`

Temporary — Phase 3 rewrites this file. Do it anyway so Phase 1 is shippable on its own.

- [ ] Import `SITE_URL` from `@/lib/seo`.
- [ ] Replace `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://waraqa-store.vercel.app')`
      with `metadataBase: new URL(SITE_URL)`.
- [ ] Replace `url: 'https://waraqa.store'` in `openGraph` with `url: SITE_URL`.

### 1.6 Build and commit

- [ ] `npm run build` — must pass.
- [ ] Hit `/sitemap.xml` once and confirm 20 `<url>` entries.
- [ ] Commit: `SEO: add sitemap, robots, and a single canonical origin`

---

## Phase 2 — Structured data (AEO, ~half a day)

Answer engines quote what they can parse. This phase is the highest AEO return per hour.
All of it is additive; nothing here moves or breaks a route.

### 2.1 Create `src/lib/schema.ts`

- [ ] New file with JSON-LD builders. Keep them pure — they are called from server
      components and must not read anything but their arguments.

```ts
// ============================================================
// Waraqa Store — JSON-LD builders
// ============================================================
//
// One module so every page emits the same organisation identity and the same
// URL shapes. Answer engines cite whichever page they can parse; an entity that
// contradicts itself across pages gets cited as neither.

import type { Product } from '@/types';
import type { Locale } from '@/lib/translations';
import { BRAND, WHATSAPP_NUMBER } from '@/lib/constants';
import { SITE_URL, absoluteUrl } from '@/lib/seo';

const ORG_ID = `${SITE_URL}/#organization`;

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: BRAND.name,
    alternateName: BRAND.nameAr,
    url: SITE_URL,
    logo: `${SITE_URL}/logos/waraqa-1x1-dark-1024.png`,
    description: BRAND.description,
    slogan: BRAND.tagline,
    telephone: `+${WHATSAPP_NUMBER}`,
    areaServed: { '@type': 'Country', name: 'Egypt' },
    address: { '@type': 'PostalAddress', addressCountry: 'EG' },
  };
}

export function webSiteSchema(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: absoluteUrl(locale, '/'),
    name: BRAND.name,
    inLanguage: locale === 'ar' ? 'ar-EG' : 'en',
    publisher: { '@id': ORG_ID },
  };
}

export function breadcrumbSchema(
  locale: Locale,
  trail: { name: string; path: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(locale, crumb.path),
    })),
  };
}

/** Availability must mirror the storefront's own in-stock rule exactly. */
function availability(product: Product) {
  return product.stock > 0 && product.status === 'Active'
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';
}

export function productSchema(product: Product, locale: Locale) {
  const isAr = locale === 'ar';
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${absoluteUrl(locale, `/product/${product.slug}`)}#product`,
    name: isAr ? product.nameAr || product.name : product.name,
    alternateName: isAr ? product.name : product.nameAr || undefined,
    description: isAr
      ? product.descriptionAr || product.description
      : product.description,
    inLanguage: isAr ? 'ar-EG' : 'en',
    sku: product.sku,
    mpn: product.sku,
    image: product.images.map((src) => `${SITE_URL}${src}`),
    category: product.category,
    brand: { '@type': 'Brand', name: BRAND.name },
    material: product.paperType,
    size: product.size,
    // GSM and sheet count are the two specs Egyptian buyers actually search on,
    // so they are exposed as parseable properties rather than buried in prose.
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Paper weight', value: `${product.gsm} gsm` },
      { '@type': 'PropertyValue', name: 'Sheets', value: String(product.sheets) },
      { '@type': 'PropertyValue', name: 'Paper type', value: product.paperType },
    ],
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(locale, `/product/${product.slug}`),
      price: product.price,
      priceCurrency: 'EGP',
      availability: availability(product),
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': ORG_ID },
      areaServed: { '@type': 'Country', name: 'Egypt' },
    },
  };
}

export function itemListSchema(products: Product[], locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(locale, `/product/${p.slug}`),
      name: locale === 'ar' ? p.nameAr || p.name : p.name,
    })),
  };
}

export function faqSchema(items: { q: string; a: string }[], locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale === 'ar' ? 'ar-EG' : 'en',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}
```

> `product.descriptionAr` is referenced above and does not exist yet. Phase 4 adds it to
> the type and the data. To keep this phase compiling, **add `descriptionAr?: string;` to
> `Product` in `src/types/index.ts` now** and fill the data in Phase 4.

### 2.2 Create `src/components/seo/JsonLd.tsx`

- [ ] One shared emitter so no page hand-rolls `dangerouslySetInnerHTML` again:

```tsx
import React from 'react';

/**
 * Server-only JSON-LD emitter. `dangerouslySetInnerHTML` is correct here — the
 * payload is our own object graph run through JSON.stringify, never user input —
 * but it is confined to this one component so no page repeats the pattern.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

### 2.3 Add FAQ copy to `src/lib/translations.ts`

- [ ] Add a `faq` section to **both** the `en` and `ar` trees, after `about`. Same key
      order in both. Six entries; answers must be factually consistent with
      `src/lib/constants.ts` (Cairo/Giza vs elsewhere, free over 800 EGP in the Cairo
      zone only, 3–7 business days, cash on delivery) and with `products.json`
      (A5/A4/mini/square/large sizes, 150–320 gsm, mixed-media/kraft/drawing).

```ts
faq: {
  title: 'Questions, answered',
  items: [
    { q: 'Do you deliver across Egypt?', a: '...' },
    { q: 'How much is delivery and when does it arrive?', a: '...' },
    { q: 'How do I pay?', a: '...' },
    { q: 'What does gsm mean and which weight should I pick?', a: '...' },
    { q: 'Which sketchbook suits watercolour or markers?', a: '...' },
    { q: 'Is the paper acid-free?', a: '...' },
  ],
},
```

Write the Arabic as Egyptian Arabic in the register already used in the `ar` tree — do
not machine-translate stiffly, and do not invent a claim the English side does not make.

### 2.4 Wire the schema in

- [ ] **Root layout** (`src/app/layout.tsx` for now, `src/app/[locale]/layout.tsx` after
      Phase 3): render `<JsonLd data={[organizationSchema(), webSiteSchema(locale)]} />`
      inside `<body>`, after `<Footer />`.
- [ ] **Product page**: replace the inline `<script type="application/ld+json">` block
      (currently at `src/app/product/[slug]/page.tsx:97`) with
      `<JsonLd data={[productSchema(product, locale), breadcrumbSchema(locale, [...])]} />`.
      Breadcrumb trail: Home `/` → Shop `/shop` → product name `/product/<slug>`.
      Keep the existing explanatory comment above it.
- [ ] **Shop page**: emit `itemListSchema(products, locale)`. The current shop page is a
      client component, so add this in the **server wrapper** created in Phase 3.4 using
      the bundled catalog (`src/data/products.json`), not the client's live list.
- [ ] **About page**: render the FAQ visibly (an accordion or a simple `<dl>` — match the
      existing about-page section rhythm) **and** emit `faqSchema(t.faq.items, locale)`.
      Visible text and schema must be identical strings; schema-only FAQ is a policy
      violation and gets ignored.

### 2.5 Build and commit

- [ ] `npm run build`.
- [ ] Paste one product page's rendered JSON-LD into validator.schema.org — zero errors.
- [ ] Commit: `AEO: Organization, WebSite, Breadcrumb, ItemList and FAQ structured data`

---

## Phase 3 — Locale routing (the architecture change)

This is the phase that makes Arabic exist for crawlers. **It moves files.** Do it in one
sitting, in the order given.

### 3.1 Move the route tree under `[locale]`

- [ ] `git mv` each of these into `src/app/[locale]/`:
      `page.tsx`, `not-found.tsx`, `shop/`, `about/`, `cart/`, `checkout/`,
      `confirmation/`, `product/`.
- [ ] **Do not move** `globals.css`, `sitemap.ts`, `robots.ts`.
- [ ] Move `src/app/favicon.ico` → `public/favicon.ico`. (With `[locale]` as the root
      segment, the app-dir favicon convention no longer resolves; `public/` always does.)
      Keep the explicit `icons` entries in metadata regardless.
- [ ] Result:

```
src/app/layout.tsx            ← DELETED in 3.3
src/app/globals.css
src/app/robots.ts
src/app/sitemap.ts
src/app/[locale]/layout.tsx   ← NEW root layout (3.3)
src/app/[locale]/page.tsx
src/app/[locale]/not-found.tsx
src/app/[locale]/shop/page.tsx
src/app/[locale]/about/page.tsx
src/app/[locale]/cart/page.tsx
src/app/[locale]/checkout/page.tsx
src/app/[locale]/confirmation/page.tsx
src/app/[locale]/product/[slug]/page.tsx
```

### 3.2 Create `src/middleware.ts`

- [ ] New file (note: `src/middleware.ts`, **not** repo root — this project uses `src/`):

```ts
import { NextResponse, type NextRequest } from 'next/server';

const LOCALES = ['en', 'ar'] as const;
const DEFAULT_LOCALE = 'en';
const COOKIE = 'NEXT_LOCALE';

/**
 * Send every un-prefixed path to a locale-prefixed one.
 *
 * Language used to live in localStorage, which the server cannot read — so every
 * crawler, and every first paint, got English no matter what. A cookie can be read
 * during the request, so the choice now happens before rendering and the served
 * HTML matches the language the visitor actually gets.
 *
 * A redirect (not a rewrite) is deliberate: each language must settle on one
 * canonical URL, or both end up competing for the same one in the index.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocale) return NextResponse.next();

  const cookie = request.cookies.get(COOKIE)?.value;
  const accept = (request.headers.get('accept-language') || '').toLowerCase();
  const locale = LOCALES.includes(cookie as (typeof LOCALES)[number])
    ? cookie
    : accept.startsWith('ar')
      ? 'ar'
      : DEFAULT_LOCALE;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except API routes, Next internals, and any path with a file
  // extension — which keeps /sitemap.xml, /robots.txt and /products/*.jpeg
  // reachable without a locale prefix.
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
```

### 3.3 Write `src/app/[locale]/layout.tsx`, delete `src/app/layout.tsx`

- [ ] Start from the current `src/app/layout.tsx` and keep the font setup and provider
      nesting **exactly as they are**. Change only what is listed:
  - Add `export const dynamicParams = false;` and
    `export function generateStaticParams() { return LOCALES.map((locale) => ({ locale })); }`
  - Replace the static `export const metadata` with an
    `export async function generateMetadata({ params }: { params: Promise<{ locale: string }> })`
    that resolves the locale, picks the title/description/keywords for that language, and
    sets `alternates: seoAlternates(l, '/')`, `openGraph.url: absoluteUrl(l, '/')`, and
    `...ogLocale(l)`. Keep `metadataBase: new URL(SITE_URL)` and the existing `icons`.
    English title/description/keywords: reuse the current strings verbatim.
    Arabic: write real Arabic equivalents — keep `ورقة`, `سكتش بوك`, `دفتر رسم`,
    `ورق كانسون`, `سكتش بوك مصر` in `keywords`.
  - The component becomes `async`, awaits `params`, and renders:

```tsx
const { locale } = await params;
const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
const isRTL = l === 'ar';

return (
  <html
    lang={l}
    dir={isRTL ? 'rtl' : 'ltr'}
    suppressHydrationWarning
    className={`${fraunces.variable} ${inter.variable} ${tajawal.variable}${isRTL ? ' rtl' : ''}`}
  >
```

  - `<LanguageProvider locale={l}>` — pass the locale down as a prop.
  - Add `<JsonLd data={[organizationSchema(), webSiteSchema(l)]} />` after `<Footer />`.
- [ ] Delete `src/app/layout.tsx`. There must be exactly one `<html>` in the app.
- [ ] Confirm `globals.css` is still imported from the new layout (`import '../globals.css';`
      — the relative depth changed by one level).

> `.rtl` is an existing class the stylesheet keys off; it used to be toggled on
> `documentElement` from an effect. Setting it in `className` server-side is what removes
> the first-paint LTR flash. Do not drop it.

### 3.4 Give `/`, `/shop`, `/about` real metadata

Same recipe for each of the three. Shop is spelled out; repeat for the other two.

- [ ] `git mv src/app/[locale]/shop/page.tsx src/app/[locale]/shop/ShopClient.tsx`
- [ ] In `ShopClient.tsx`: keep `'use client'`, rename the default export to `ShopClient`.
      Change nothing else.
- [ ] New server `src/app/[locale]/shop/page.tsx`:

```tsx
import React from 'react';
import type { Metadata } from 'next';
import type { Product } from '@/types';
import productsData from '@/data/products.json';
import { translations } from '@/lib/translations';
import { isLocale, DEFAULT_LOCALE, seoAlternates, absoluteUrl, ogLocale } from '@/lib/seo';
import { itemListSchema, breadcrumbSchema } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';
import ShopClient from './ShopClient';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = translations[l];
  return {
    title: t.shop.title,
    description: t.shop.description,
    alternates: seoAlternates(l, '/shop'),
    openGraph: {
      title: t.shop.title,
      description: t.shop.description,
      url: absoluteUrl(l, '/shop'),
      ...ogLocale(l),
    },
  };
}

export default async function ShopPage({ params }: Params) {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const products = productsData as Product[];

  return (
    <>
      <ShopClient />
      {/* Listed from the bundled catalog, not the client's live fetch: this markup
          has to be in the server response to be read at all. */}
      <JsonLd
        data={[
          itemListSchema(products, l),
          breadcrumbSchema(l, [
            { name: translations[l].nav.home, path: '/' },
            { name: translations[l].nav.shop, path: '/shop' },
          ]),
        ]}
      />
    </>
  );
}
```

- [ ] Home: `page.tsx` → `HomeClient.tsx`, new server `page.tsx` using `t.hero` copy for
      title/description and `seoAlternates(l, '/')`. No extra JSON-LD (the layout already
      emits Organization + WebSite).
- [ ] About: `page.tsx` → `AboutClient.tsx`, new server `page.tsx` using `t.about.title` /
      `t.about.subtitle`, `seoAlternates(l, '/about')`, plus the FAQ JSON-LD from 2.4.
- [ ] `cart`, `checkout`, `confirmation`: no server wrapper needed, but they must not be
      indexed. You cannot export `metadata` from a client component, so add a tiny
      `layout.tsx` in each of the three folders that exports
      `export const metadata = { robots: { index: false, follow: true } };` and returns
      `children`.

### 3.5 Rewrite `src/context/LanguageContext.tsx`

Locale is now a URL fact, not stored state.

- [ ] `LanguageProvider` takes `{ locale, children }`. Delete the `useStoredString` import,
      the `STORAGE_KEY`, the local `isLocale`, and **both** `useEffect` blocks — `dir`,
      `lang` and `.rtl` are server-rendered now, and first-visit language detection moved
      to the middleware.
- [ ] `setLocale` writes the cookie and navigates:

```tsx
const router = useRouter();
const pathname = usePathname();

const setLocale = useCallback(
  (next: Locale) => {
    if (next === locale) return;
    // Read by the middleware on the next un-prefixed request, so a returning
    // visitor lands in the language they chose.
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
    const rest = pathname.replace(/^\/(en|ar)(?=\/|$)/, '');
    router.push(`/${next}${rest}`);
  },
  [locale, pathname, router]
);
```

- [ ] `toggleLocale` becomes `() => setLocale(isRTL ? 'en' : 'ar')`.
- [ ] Keep the `useMemo` on the context value and the `useLanguage` hook unchanged.
- [ ] `LanguageToggle.tsx` needs **no change** — it already calls `setLocale`.

### 3.6 Make every internal link locale-aware

Every `<Link href="/shop">` must become `/en/shop` or `/ar/shop`. Add a small
`useLocalePath()` hook (in `LanguageContext.tsx`, returning
`(path: string) => localePath(locale, path)`) and apply it at these exact sites:

- [ ] `src/components/layout/Navbar.tsx` — the `navLinks` array (`/`, `/shop`, `/about`)
      and the hardcoded `href="/shop"` and `href="/cart"`.
- [ ] `src/components/layout/Footer.tsx` — `/`, `/shop`, `/about`, `/cart`.
      Leave the `wa.me` link alone.
- [ ] `src/components/layout/MobileMenu.tsx` — `href={link.href}` and `href="/cart"`.
- [ ] `src/components/shop/ProductCard.tsx`, `src/components/product/RelatedProducts.tsx`,
      `src/components/product/ProductBreadcrumb.tsx`, `src/components/cart/*`,
      `src/components/home/*`, `src/app/[locale]/not-found.tsx` — grep once for
      `href="/` and ``href={`/`` across `src/components` and `src/app`, and fix every hit.
- [ ] Also fix programmatic navigation: grep for `router.push('/` and `router.replace('/`
      (checkout → confirmation is the known one).

> Missing one link is not fatal — the middleware will redirect it — but each miss costs a
> redirect hop and dilutes the canonical. Fix them all.

### 3.7 Product page under `[locale]`

- [ ] `params` is now `Promise<{ locale: string; slug: string }>`.
- [ ] `generateStaticParams` must return the cross product:

```ts
export function generateStaticParams() {
  return LOCALES.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })));
}
```

- [ ] `generateMetadata`: use `nameAr`/`descriptionAr` when `locale === 'ar'`, and replace
      the bare `alternates: { canonical: ... }` with
      ``alternates: seoAlternates(l, `/product/${product.slug}`)``.
- [ ] Keep `export const revalidate = 300;` and the comment explaining it.
- [ ] Swap the inline JSON-LD for
      `<JsonLd data={[productSchema(product, l), breadcrumbSchema(...)]} />`.

### 3.8 Build and verify, then commit

- [ ] `npm run build` — must pass with no type errors.
- [ ] Verify with `curl` (not a browser — you are checking the *served HTML*):
  - `curl -sI http://localhost:3000/shop` → `307` to `/en/shop`
  - `curl -s http://localhost:3000/ar | grep -o '<html[^>]*>'` → contains `lang="ar"` and `dir="rtl"`
  - `curl -s http://localhost:3000/ar/shop | grep -c 'سكتش'` → greater than 0
  - `curl -s http://localhost:3000/en | grep -o 'hreflang="[^"]*"'` → `en`, `ar`, `x-default`
- [ ] Commit: `SEO: URL-based locale routing with hreflang, server-rendered lang/dir`

---

## Phase 4 — Arabic product content

Without this, `/ar/product/*` serves Arabic chrome around an English product description —
which is what an answer engine would quote back to an Arabic query.

- [ ] `src/types/index.ts`: promote `descriptionAr` on `Product` from optional to required
      (`descriptionAr: string;`) and add `descriptionAr?: string;` to `ApiProduct`.
- [ ] `src/lib/catalog.ts` / `src/lib/api.ts`: map `descriptionAr` through from the API
      response, falling back to `''`. Read the existing mapping function and follow its
      shape — do not restructure it.
- [ ] `src/data/products.json`: add `descriptionAr` to all 8 products, immediately after
      `description`. Translate the existing English description into Egyptian Arabic.
      **Do not invent specs.** Every gsm figure, sheet count, size and paper type must
      match the sibling fields in the same object. Keep the Latin-script tokens the market
      actually uses (`A5`, `A4`, `gsm`) alongside Arabic terms like `مكسد ميديا`.
- [ ] `src/components/product/ProductInfo.tsx`: line ~32 already does
      `isRTL ? (product.nameAr || product.name) : product.name`. Apply the same pattern to
      the description.
- [ ] `src/app/[locale]/shop/ShopClient.tsx`: add `p.descriptionAr` to the search
      `haystack` array so Arabic search terms match.
- [ ] **Apps Script:** if the Google Sheet is the source of truth for the catalog, add a
      `descriptionAr` column and return it from `waraqa-apps-script.gs`. **Editing the
      local `.gs` file does nothing** — the user must paste it into the Apps Script editor
      and redeploy the Web App. Call this out explicitly in your final report.
- [ ] `npm run build`, then commit: `Content: Arabic product descriptions`

---

## Phase 5 — Verification

Run all of it. Report the actual output; do not assert a check passed without running it.

- [ ] `npm run build` clean, `npm run lint` clean.
- [ ] `/sitemap.xml` returns 20 URLs, each with `xhtml:link` alternates.
- [ ] `/robots.txt` returns the sitemap line with the production origin.
- [ ] `curl -s <origin>/ar/product/a5-kraft-sketchbook-180gsm` → the Arabic name and
      Arabic description appear in the **raw HTML**, not just after hydration.
- [ ] Every `<link rel="alternate" hreflang>` pair is reciprocal: `/en/x` points to
      `/ar/x` and back.
- [ ] validator.schema.org: zero errors on `/en`, `/en/shop`, `/en/about`, and one product
      page, plus their `/ar` counterparts.
- [ ] Google Rich Results Test on one product page → "Product snippets" eligible.
- [ ] Switching language via the toggle changes the URL, keeps the current page, and
      survives a hard reload.
- [ ] Cart contents survive a language switch (`CartContext` is keyed by storage, not by
      route — confirm this, do not assume it).

### Post-deploy, once a domain is live (user action, not agent)

- [ ] Google Search Console: add the property, submit `/sitemap.xml`, check the
      International Targeting report for hreflang errors.
- [ ] Bing Webmaster Tools: same. It feeds several answer engines.
- [ ] PageSpeed Insights on `/en/shop` and `/ar/shop` — Core Web Vitals could not be
      measured pre-launch.

---

## Out of scope — do not do these

- Any change to shipping fees, thresholds, or governorate zones.
- Any change to the checkout flow or the order payload.
- Adding an i18n library (`next-intl`, `next-i18next`). `translations.ts` already holds
  both trees; a library would be a rewrite for no SEO gain.
- Redesigning, restyling, or "modernising" any component.
- Translating the marketing docs under `marketing/`.

## Rollback

Phases 1, 2 and 4 are additive — revert the commit. Phase 3 moves files; if it must be
undone, `git revert` the whole Phase 3 commit rather than un-picking it, since the root
layout, middleware and every internal link changed together.
