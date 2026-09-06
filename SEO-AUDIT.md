# Waraqa Store — SEO Audit

**Audited:** 2026-09-06 · **Target:** https://waraqastore.vercel.app
**Method:** HTTP/DOM inspection of live production + repo source. No lab CWV
(no Lighthouse run), no GSC/CrUX field data, no backlink data — those sections
are marked *unmeasured*, not *passing*.

**SEO Health Score: 76 / 100**

| Category | Weight | Score |
|---|---|---|
| Technical SEO | 22% | 85 |
| Content Quality | 23% | 58 |
| On-Page SEO | 20% | 82 |
| Schema / Structured Data | 10% | 90 |
| Performance (CWV) | 10% | 80 *(lab-unmeasured)* |
| AI Search Readiness | 10% | 58 |
| Images | 5% | 90 |

Business type: **e-commerce**, bilingual EN/AR, Egypt-only shipping, 8 products,
22 indexable URLs (11 pages × 2 locales).

---

## 1. Verified-good — do not "fix" these

These were checked and are correct. Changing them is a regression.

- **hreflang** — bidirectional `en`/`ar` + `x-default`, emitted in both `<head>`
  (`seoAlternates()` in `src/lib/seo.ts`) and `sitemap.xml`, and they agree.
- **`<html lang>` / `dir`** — `/ar` correctly serves `lang="ar" dir="rtl"`.
- **Translations are real**, not mirrored English. Product `alternateName` carries
  the Arabic title, descriptions are independently written.
- **Canonicals** — self-referencing, one origin, driven by the single `SITE_URL`
  constant. `metadataBase` and `openGraph.url` agree.
- **robots.txt** — allows all, disallows `cart`/`checkout`/`confirmation` in both
  locales, declares the sitemap.
- **404s return a real 404** status, not a soft 200.
- **Images** — AVIF content negotiation works (816 KB hero → 46 KB AVIF at 1920w),
  full `srcSet` + correct `sizes`, LCP hero preloaded, below-fold lazy-loaded,
  descriptive alt text, decorative hero correctly `alt="" aria-hidden`.
- **HSTS** — `max-age=63072000; includeSubDomains; preload`.
- **Schema graph** — `Product`, `Offer`, `Brand`, `BreadcrumbList`, `ItemList`,
  `Organization`, `WebSite`, with stable `@id`s and correct cross-references.

The technical floor here is above average. The gap is domain, content depth,
and entity signals — not plumbing.

---

## 2. Findings

### 🔴 Critical

**C1 — The store runs on a `vercel.app` subdomain.**
`vercel.app` is on the Public Suffix List. Every ranking signal, brand query, and
link is accruing to a hostname Waraqa does not own and cannot consolidate later
without a full migration. It also caps CTR (a `.vercel.app` checkout reads as
untrustworthy) and blocks Merchant Center / Shopping feeds, which expect a real
domain.
- *Fix:* register the domain, point it at Vercel, set `NEXT_PUBLIC_SITE_URL`,
  301 all 22 URLs. `SITE_URL` is already a single env-driven constant, so the
  code change is one variable.
- *Failure check:* if the new GSC property does not pick up impressions within
  ~2 weeks while the old one decays, the redirects are wrong.
- *Blocks:* every other item. Do this first.

### 🟠 High

**H1 — Homepage `<title>` is `Fill the blank page.`** — 20 chars, no brand, no
product noun. The strongest page in the site targets zero commercial intent.
Product and shop titles are well-built by contrast.
- Suggested: `Waraqa (ورقة) — Handmade Sketchbooks & Art Paper in Egypt`. Keep
  the slogan as the H1.

**H2 — Homepage and `/about` emit no `og:image`, and `twitter:card` is `summary`.**
Product pages get both right (`summary_large_image` + product photo); the shared
default does not. Every homepage link shared on WhatsApp or Instagram — the
primary channels for this market — renders as a bare text link.
- *Fix:* add a 1200×630 default OG image in the root layout metadata; set
  `twitter:card: 'summary_large_image'` site-wide.

**H3 — `Offer` is missing merchant fields.** Present and correct: `price`,
`priceCurrency: EGP`, `availability`, `itemCondition`, `sku`, `mpn`, `brand`,
`additionalProperty` specs. Missing: `hasMerchantReturnPolicy` and
`shippingDetails`, both of which Google now expects for Product rich results and
Shopping eligibility. Shipping cost and governorate data already exist in
`src/lib/constants.ts` — this is a wiring job, not new information.

**H4 — Thin content and no E-E-A-T evidence.**
Word counts: home 574, shop 590, about 800, product ~1,095 (much of it the
cross-sell rail, not unique product copy). No blog, no named author, no founder.
- The site *asserts* "bound by hand in Egypt" and shows nothing to support it.
  Photos of the bindery, a named maker, a process page are first-party
  experience signals Waraqa genuinely has and is not showing.
- *Highest-leverage single page:* a paper-weight guide — "150 vs 180 vs 250 vs
  320 gsm: which sketchbook paper do you need?" It is the exact question the SKU
  names imply buyers are asking, it is informational traffic that funnels
  directly into product pages, and it exists in neither Arabic nor English at
  depth for the Egyptian market.

### 🟡 Medium

**M1 — Security headers absent.** HSTS is set; `X-Content-Type-Options`,
`Referrer-Policy`, `X-Frame-Options`/CSP `frame-ancestors`, and
`Permissions-Policy` are not. Not a ranking factor — a trust signal, and a cheap
`headers()` block in `next.config.ts`.

**M2 — `Cache-Control: public, max-age=0, must-revalidate` on HTML.** Vercel's
edge absorbs it (`X-Vercel-Cache: HIT`), so live impact is small, but
`s-maxage` + `stale-while-revalidate` would cut cold-region TTFB.

**M3 — Client-side rendering bailout on the homepage.** The served HTML contains
`BAILOUT_TO_CLIENT_SIDE_RENDERING`. Googlebot renders JS; AI crawlers largely do
not. Identify the component (likely locale- or cart-aware) and confirm no
primary content sits inside that boundary.

**M4 — No `sameAs`, no `ContactPoint`, no `llms.txt`.** `Organization` has
`telephone` and `areaServed: Egypt` but no `sameAs` array linking the Instagram
profile. That is the main mechanism by which Google and LLMs bind the site to the
brand's existing social presence — likely the single biggest untapped entity
signal, and a two-line change.

### 🟢 Low

- Root `/` uses **307** → `/en`. Prefer **308** so signals consolidate cleanly.
- `x-default` points at `/en`. Defensible, but for an Egypt-first store consider
  Arabic as default once traffic data justifies it.
- No `WebSite.potentialAction` / SearchAction — only worth adding with on-site search.

---

## 3. Action plan

| # | Action | Effort | Sequence |
|---|---|---|---|
| 1 | Register real domain; migrate with 301s (C1) | M | First — blocks all |
| 2 | Homepage title + default OG image (H1, H2) | S | Same deploy as #1 |
| 3 | `sameAs` + `ContactPoint` on Organization (M4) | S | Week 1 |
| 4 | `hasMerchantReturnPolicy` + `shippingDetails` (H3) | S | Week 1 |
| 5 | Security headers in `next.config.ts` (M1) | S | Week 1 |
| 6 | Founder / process content + photos on `/about` (H4) | M | Week 2 |
| 7 | Verify in GSC + Bing, submit sitemap | S | After #1 |
| 8 | Paper-weight guide, EN + AR (H4) | L | Week 3–4 |
| 9 | Expand each product page to 400+ unique words (H4) | L | Month 2 |

**Leading indicators — watch these instead of re-running the audit:**
- GSC impressions for non-brand queries containing "sketchbook" / "سكتش بوك".
- GSC → Enhancements → Product: valid items should go 0 → 8 after #4.
- Whether the Instagram profile joins the site's knowledge panel after #3.

---

## 4. Changelog

- **2026-09-06** — Fixed H1 (homepage title now brand+product), H2 (default
  OG image + `twitter:card: summary_large_image`), H3 (`hasMerchantReturnPolicy`
  + `shippingDetails` with Cairo/outside zones on Product offers), M1 (security
  headers: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy`), M4 (`sameAs` with Instagram + WhatsApp, `ContactPoint`
  on Organization), Low (308 permanent redirect instead of 307).
  Re-scored: On-Page 72→82, Schema 78→90, Content 55→58. **New score: 76/100.**
- **2026-09-06** — Initial audit. Applied in the same pass: `sitemap.ts` now
  emits `x-default` per URL and uses a hand-bumped `CONTENT_REVISION` instead of
  a build-time `new Date()`.
