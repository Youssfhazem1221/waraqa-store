# Waraqa Store — SEO Audit

**Audited:** 2026-09-06 · **Target:** https://waraqastore.vercel.app
**Method:** HTTP/DOM inspection of live production + repo source. No lab CWV
(no Lighthouse run), no GSC/CrUX field data, no backlink data — those sections
are marked *unmeasured*, not *passing*.

**SEO Health Score: 82 / 100** *(re-scored 2026-10-05, see §4)*

| Category | Weight | Score |
|---|---|---|
| Technical SEO | 22% | 90 |
| Content Quality | 23% | 68 |
| On-Page SEO | 20% | 88 |
| Schema / Structured Data | 10% | 92 |
| Performance (CWV) | 10% | 80 *(lab-unmeasured)* |
| AI Search Readiness | 10% | 68 |
| Images | 5% | 94 |

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
| 1 | ~~Register real domain; migrate with 301s (C1)~~ — live on waraqa.art; vercel.app mirror canonicalises to it (301 still preferable) | M | Done 2026-10-03 |
| 2 | Homepage title + default OG image (H1, H2) | S | Same deploy as #1 |
| 3 | `sameAs` + `ContactPoint` on Organization (M4) | S | Week 1 |
| 4 | `hasMerchantReturnPolicy` + `shippingDetails` (H3) | S | Week 1 |
| 5 | Security headers in `next.config.ts` (M1) | S | Week 1 |
| 6 | Founder / process content + photos on `/about` (H4) | M | Week 2 |
| 7 | Verify in GSC + Bing, submit sitemap | S | After #1 |
| 8 | ~~Paper-weight guide, EN + AR (H4)~~ — `/paper-guide` + blog | L | Done 2026-10-04 |
| 9 | Expand each product page to 400+ unique words (H4) | L | Month 2 |

**Leading indicators — watch these instead of re-running the audit:**
- GSC impressions for non-brand queries containing "sketchbook" / "سكتش بوك".
- GSC → Enhancements → Product: valid items should go 0 → 8 after #4.
- Whether the Instagram profile joins the site's knowledge panel after #3.

---

## 4. Changelog

- **2026-10-05** — Post-migration sweep (live crawl of all 42 sitemap URLs, then
  a local production build re-crawled and checked in a browser).
  *Regressions from the Vercel → Cloudflare move, fixed:* HSTS was no longer
  sent (Vercel had added it at its edge) — restored in `next.config.ts` and
  `public/_headers`; plain `http://` answered 200 — middleware now 308s to
  https when Cloudflare's `CF-Visitor` says the visitor used http (never on a
  missing header, so it cannot loop); `www.waraqa.art` and the production
  `*.vercel.app` mirror served full copies — both 308 to the canonical
  origin, in the same hop as the locale redirect. **Still turn on Cloudflare ▸
  SSL/TLS ▸ Edge Certificates ▸ Always Use HTTPS**: it also covers static files,
  which the Worker never sees.
  *On-page:* 26 of 42 pages emitted no `og:image` — every page that set its own
  `openGraph` replaced the layout's wholesale. New `ogDefaults()` in
  `lib/seo.ts`; a 1200×630, 92 kB default card (`/og-image.jpg`; the old one
  was the 816 kB hero, past WhatsApp's ~300 kB preview limit, and not really
  1200×630), 1200×630 cards per blog post and per product (`public/og/`).
  Layout `twitter` now sets only the card type, so X uses each page's og:*
  instead of the homepage text. English blog titles (75–79 chars) drop the
  brand suffix; product descriptions are trimmed to 155 at a word boundary; the
  About page has a real meta description in both languages; shop gained an
  `sr-only` h2 (cards are h3 under the h1). Blog post heroes have descriptive
  alt text (EN + AR). All other alt="" images were checked and are decorative.
  *Schema:* `hasMerchantReturnPolicy` said `MerchantReturnNotPermitted` while
  `/returns` grants 14 days — now `MerchantReturnFiniteReturnWindow`, 14
  days, `ReturnByMail`, `merchantReturnLink`. `JsonLd` escapes `<`, `>`, `&`
  (Sheet text reaches it via the live catalog).
  *Links:* footer → paper guide + blog on every page; each product page →
  the paper-guide section for its weight. No broken internal links (46 checked).
  *AI:* `/llms.txt`, generated from the catalog, posts and policy copy.
  *Images:* JPEG originals recompressed in place, same dimensions (9.6 → 5.4 MB).
  *Performance:* catalog reads are stale-while-revalidate (`lib/catalog.ts`):
  homepage TTFB 3.45 s → 0.04 s locally once the 60 s cache has lapsed; LCP
  images use `fetchPriority="high"` (`priority` is deprecated in Next 16).
  Local Lighthouse mobile, 3 runs: product LCP 5.5 s → 3.4–3.7 s; homepage
  perf 55–71 (high variance, LCP is the h1 waiting on web fonts + JS; PostHog's
  recorder and surveys add ~56 kB). No field data: CrUX has none for this
  traffic level and the PSI API quota was exhausted — CWV remains *unmeasured*
  in production. Security headers: CSP added (first-party + PostHog + Apps
  Script; inline scripts allowed for the App Router).
  Re-scored: Technical 85→90, On-Page 82→88, Schema 90→92, AI 64→68, Images
  90→94. **New score: 82/100.** Still open: #6, #7 (verify by DNS), #9.

- **2026-10-04** — C1: store is live on `https://waraqa.art` (Cloudflare Workers,
  since 2026-10-03); `SITE_URL` points there and the `waraqastore.vercel.app`
  mirror (Vercel still builds `main`) emits `canonical` → waraqa.art. A host-level
  301 from vercel.app would be cleaner — open item. H4/#8: shipped `/paper-guide`
  (EN + AR, ~900 words each, gsm table, three medium sections linking to the
  matching live products, kraft vs white, sizes, quick answers) and `/blog` with
  four posts written separately in EN and AR (choosing a first sketchbook,
  drawing on kraft, watercolour without buckling, 30 things to draw in Cairo).
  `Article`/`BlogPosting` JSON-LD authored by the `#organization` node (no named
  author — none exists yet), `BreadcrumbList` on every new page, all new routes
  in `sitemap.ts`, `CONTENT_REVISION` bumped. Internal links: navbar "Paper
  guide" menu (per-medium anchors) + "Blog", home hero CTA and home guide cards
  → `/paper-guide`, blog posts → guide + products. No `FAQPage`/`HowTo` added.
  Re-scored: Content 58→68 (founder/process content and longer product copy
  still missing), AI Search Readiness 58→64. **New score: 79/100.** Rankings and
  CWV for the new pages are unmeasured.

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
