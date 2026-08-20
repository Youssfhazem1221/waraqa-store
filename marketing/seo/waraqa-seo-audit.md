# Waraqa (ورقة) — Pre-Launch SEO Audit

**Prepared:** 2026-08-20
**Scope note:** No live domain is configured anywhere in this repo (`.env.example` has no site URL; no deploy config found). This is a **pre-launch, code-based readiness audit** — sitemap, metadata, hreflang, heading structure, schema. It cannot check Core Web Vitals, real indexation, or live crawlability. Re-run a live audit (PageSpeed Insights, Search Console coverage) once a domain exists.

---

## Executive summary

The site's biggest SEO issue isn't technical hygiene — it's that **the Arabic half of the store is invisible to search engines**, despite Arabic being the site's second first-class language and Arabic keywords already sitting in the metadata. Everything else below is fixable in an afternoon; the localization issue needs an actual architecture decision.

**Top priority issues:**
1. Bilingual content has no crawlable URL — Arabic is functionally unindexable (Critical)
2. No `sitemap.xml` or `robots.txt` exist (High)
3. `/shop` and `/about` have no page-specific title/description (High)
4. `metadataBase` and `openGraph.url` point to two different domains (Medium)
5. No Product/Offer structured data on product pages (Medium)

---

## Technical SEO findings

### 1. Bilingual content is not crawlable — no locale routing
**Impact:** Critical
**Evidence:** `src/context/LanguageContext.tsx` initializes locale to `'en'` on every render (explicitly, "to avoid a hydration mismatch"), then only switches client-side after mount based on `localStorage` or `navigator.language`. There is no `/ar` URL prefix, no `next-intl`/i18n config in `next.config.ts` — every page is a single URL serving both languages via client state.
**Why it matters:** Root metadata already targets Arabic search terms (`دفتر رسم`, `سكتش بوك`) and `src/lib/translations.ts` has full Egyptian-Arabic copy written — but none of it is reachable by a URL Google can index as Arabic. Googlebot's initial HTML (and most JS-rendering crawlers, which don't run with a stored `ar` preference) will only ever see English. This is real, existing search demand (Egyptian buyers searching in Arabic) that the site currently cannot rank for at all.
**Fix:** Move to URL-based locale routing (`/ar/...` and `/en/...`, or `/ar` prefix with English as default) so each language has its own indexable, hreflang-linked URL. This is an architecture change, not a metadata tweak — scope it as its own task before the marketing pages in the companion competitor-analysis doc go live in Arabic.

### 2. No sitemap or robots file
**Impact:** High
**Evidence:** No `src/app/sitemap.ts` or `src/app/robots.ts`, and no `public/robots.txt`.
**Fix:** Add both — Next.js App Router supports `app/sitemap.ts` and `app/robots.ts` as route handlers (works with static export too). Sitemap should list `/`, `/shop`, `/about`, and every `/product/[slug]` (already has `generateStaticParams` — reuse that list).

### 3. Domain mismatch in metadata
**Impact:** Medium
**Evidence:** `src/app/layout.tsx` line 32: `metadataBase` falls back to `https://waraqa-store.vercel.app`. Line 59: `openGraph.url` is hardcoded to `https://waraqa.store`. These must be the same domain or canonical/OG URLs resolve incorrectly.
**Fix:** Set `NEXT_PUBLIC_SITE_URL` to the real production domain and reference it in both places instead of a hardcoded string.

### 4. `<html lang>` doesn't match visible content on first paint
**Impact:** Medium (SEO + accessibility)
**Evidence:** `layout.tsx` line 73 hardcodes `lang="en"`. `LanguageContext.tsx` only updates `document.documentElement.lang`/`dir` in a `useEffect` after mount.
**Fix:** Once locale routing exists (finding #1), this resolves naturally — each `/ar/...` route can server-render `lang="ar" dir="rtl"` directly.

### 5. No structured data on product pages
**Impact:** Medium
**Evidence:** `/product/[slug]/page.tsx` has price, images, description, and SKU available server-side via `generateMetadata`, but no JSON-LD is emitted.
**Fix:** Add `Product`/`Offer` schema (price in EGP, availability, image) — see the `schema` skill. Low effort given the data already exists in `products.json`.

---

## On-page SEO findings

### 6. `/shop` and `/about` inherit the generic homepage title/description
**Impact:** High
**Evidence:** Both `src/app/shop/page.tsx` and `src/app/about/page.tsx` are `'use client'` components — Next.js doesn't allow client components to export `metadata`, and neither has a server-component wrapper providing one. Only `/product/[slug]` correctly uses `generateMetadata`.
**Fix:** Wrap each in a thin server-component layout/page that exports `metadata`, or restructure so the data-fetching/interactive parts stay client-side while a server parent owns the metadata export.

### 7. What's already working
- Product pages have real per-product `generateMetadata` (title, description, OG image) — good.
- Root metadata already includes bilingual keywords.
- Breadcrumb nav (`aria-label="Breadcrumb"`) on product pages supports internal linking/site architecture.
- `generateStaticParams` on product pages means all 8 product URLs are staticaly known — sitemap generation is trivial once added.

---

## Content findings

- No customer testimonials, reviews, founder bio, or production photos exist anywhere in the codebase (confirmed via repo search) — this is an E-E-A-T gap, not a technical one. See the companion content-strategy doc's "Behind the Paper" pillar, which is designed partly to fill this.
- The two comparison/buyer's-guide pages drafted in `marketing/competitors/waraqa-competitor-analysis.md` are the strongest near-term content for capturing existing search demand ("sketchbook Egypt", "أفضل دفتر رسم في مصر") — prioritize shipping those over new content until they exist.

---

## Prioritized action plan

1. **Critical — architecture:** Decide and implement URL-based locale routing for EN/AR before investing further in Arabic content or Arabic keyword targeting.
2. **High:** Add `app/sitemap.ts` and `app/robots.ts`.
3. **High:** Give `/shop` and `/about` real per-page metadata.
4. **Medium:** Fix the `metadataBase`/`openGraph.url` domain mismatch once the production domain is finalized.
5. **Medium:** Add `Product`/`Offer` JSON-LD to product pages.
6. **Ongoing:** Once deployed with a real domain, re-run this audit live — submit the sitemap to Search Console, check actual Core Web Vitals, and verify indexation.
