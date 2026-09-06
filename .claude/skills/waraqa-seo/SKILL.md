---
name: waraqa-seo
description: SEO invariants and conventions for the Waraqa Store codebase. Load before touching metadata, JSON-LD, sitemap.ts, robots.ts, lib/seo.ts, middleware, next.config headers, product data, page copy, or images — and before answering any question about this site's SEO, rankings, or indexing.
---

# Waraqa Store — SEO rules

Audit findings and current scores live in `SEO-AUDIT.md` at the repo root.
This file is the *rules*; that file is the *state*. Read both before SEO work.

## Non-negotiable invariants

Breaking any of these is a regression, even if a build passes.

1. **One origin.** Every absolute URL comes from `SITE_URL` in `src/lib/seo.ts`,
   which reads `NEXT_PUBLIC_SITE_URL`. Never hardcode a host anywhere else —
   the vercel.app/waraqa.store split is exactly the bug that constant exists to
   prevent. Canonical, OG, JSON-LD `@id`, and sitemap must all resolve to it.

2. **hreflang stays symmetric.** Every page emits `en`, `ar`, and `x-default`,
   in both `<head>` and `sitemap.xml`, and the two must agree. `seoAlternates()`
   is the only source — do not hand-roll alternates in a page.

3. **Both locales, always.** Any new route ships `/en` and `/ar` together, with
   real Arabic copy in `src/lib/translations.ts`. Never machine-mirror English
   into the Arabic tree, and never ship an `/ar` page that renders English.
   `/ar` must serve `lang="ar" dir="rtl"` server-side.

4. **Sitemap `lastModified` is hand-bumped.** `CONTENT_REVISION` in
   `src/app/sitemap.ts` moves only when page copy or the catalog actually
   changes. Never restore a build-time `new Date()` — a lastmod that churns on
   every deploy is discounted by crawlers, which destroys the signal for real
   updates. A new route or product means: add it to the sitemap *and* bump the
   constant.

5. **Transactional routes stay out of the index.** `cart`, `checkout`, and
   `confirmation` are disallowed in `robots.ts` for both locales and must never
   enter `sitemap.ts`.

6. **JSON-LD must describe what is on the page.** Never emit `aggregateRating`,
   `review`, or a rating count that is not backed by real customer reviews.
   Fabricated review markup is a manual-action risk, not an optimization.

7. **Prices and stock are runtime data, not sitemap or build data.** The sitemap
   is built from the bundled catalog deliberately; do not wire it to the Apps
   Script feed.

## Conventions

- **Schema:** JSON-LD only, in `<script type="application/ld+json">`. Reuse the
  existing `@id` scheme (`#organization`, `#website`, `<url>#product`) and
  reference by `@id` rather than duplicating nodes.
- **Never add `HowTo` schema** — deprecated by Google, Sept 2023.
- **Never add `FAQPage` for SERP benefit** — Google retired FAQ rich results for
  all sites on 2026-05-07. Existing `FAQPage` is harmless; leave it. For genuine
  customer Q&A use `QAPage`.
- **Core Web Vitals:** the responsiveness metric is **INP**. Never write FID.
- **Images:** keep using `next/image`. Product images need descriptive alt text
  matching the product name; purely decorative images get `alt="" aria-hidden`.
  Never set `loading="lazy"` on the LCP hero.
- **Titles:** `<Page> · Waraqa (ورقة)`, ~50–60 chars. Descriptions 120–160,
  written for a buyer, not stuffed.
- **Comments:** this repo documents *why*, not *what*, and only where a reader
  would be puzzled. Match that. Preserve existing comments verbatim when moving
  code — several of them record the reason a past bug is not coming back.

## When asked to "improve SEO"

Work from `SEO-AUDIT.md` §3 in order. Do not start with the cheap wins — item 1
(real domain) blocks the value of everything below it, and shipping content or
links onto a `vercel.app` host wastes them.

Do not re-audit from scratch when the audit is current. Do update
`SEO-AUDIT.md` §4 changelog when an item is completed, and re-score only the
category that actually changed.

## What must not be claimed without measurement

State these as unmeasured rather than passing, unless data was fetched this session:

- Core Web Vitals / PageSpeed numbers — needs a real Lighthouse or CrUX run.
- Rankings, impressions, indexation counts — needs Search Console.
- Backlink or authority metrics — no backlink data source is configured here.

An estimate presented as a measurement is worse than saying "not measured."
