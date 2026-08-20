# Waraqa (ورقة) — Copywriting Audit

**Prepared:** 2026-08-20
**Scope:** Line-by-line review of existing site copy (`src/lib/translations.ts`, `src/data/products.json`) against the copywriting skill's principles. This is an audit of what's already written, not a rewrite brief — most of it holds up well.

---

## Headline finding: the existing copy is already good

This isn't the usual "everything needs rewriting" audit. The checkout flow, product descriptions, and Arabic copy in particular are genuinely well-crafted — specific, active, honest, and written in a real voice rather than templated e-commerce boilerplate. The issues below are real but narrow.

---

## What's working (worth protecting, not "fixing")

- **Product descriptions are specific, not generic.** Every one of the 8 SKUs names the exact media it handles: *"perfect for watercolour, gouache, ink, and markers"* (A5 Mixed Media), *"ideal for pencil, charcoal, and pastel work"* (A5 Kraft). This is "benefits over features" done correctly — gsm is a feature, "won't bleed when you use markers" is the benefit, and the copy states both.
- **Checkout error copy tells you what's wrong *and* how to fix it.** `"Please enter a valid Egyptian mobile number (010, 011, 012, 015)"` — this is the standard the skill asks for (no vagueness, no apology, actionable). Don't touch this pattern; extend it if new fields are ever added.
- **The Arabic copy is a genuine differentiator, not a translation.** Lines like *"خلّصت الكمية"* (sold out) and *"هنكلمك عليه واتساب عشان نرتب ميعاد وصول المندوب"* (checkout phone hint) are written in real spoken Egyptian Arabic, not formal MSA or a mechanical translation of the English. This is rare among Egyptian e-commerce sites and is worth calling out as a brand asset in its own right — see the companion SEO audit's finding that this Arabic content currently isn't even indexable, which makes it a wasted asset today.
- **The COD trust framing is smart.** Grouping "Cash on Delivery" under the same trust-row treatment as delivery and paper quality (`secureTitle: 'Cash on Delivery'`, `secureDesc: 'Inspect your sketchbooks first, then pay the courier in cash'`) reframes what could read as a payment limitation into a reassurance. Keep this framing anywhere COD is mentioned.

---

## Real issues

### 1. The hero CTA is vaguer than it needs to be
**Evidence:** `hero.shopCta: 'Explore Sketchbooks'` vs. `featured.viewAll: 'See all 8 sketchbooks'`.
The second is a stronger CTA by the skill's own formula (action + specific thing they get) — naming the exact count makes the offer concrete and mildly curiosity-inducing. The hero CTA, which gets more prominence and is seen first, uses the weaker, more generic phrasing.
**Fix:** Change the hero CTA to something equally specific, e.g. *"Shop All 8 Sketchbooks"* — reuse the number that already works two sections down.

### 2. The About page promises a story it doesn't tell
**Evidence:** `about.sec1Title: 'Why We Started Waraqa'` — but the content underneath (`voice1Desc`, `voice2Desc`) doesn't answer "why," it restates brand values already covered elsewhere on the same page (warm/unintimidating, honest craft). There's no founder, no origin moment, no actual narrative.
**Why it matters:** This is a heading making a promise the body doesn't keep — a "one idea per section" violation, and it compounds a real gap flagged in both the SEO audit (no E-E-A-T trust signals) and the content-strategy doc's "Behind the Paper" pillar (no founder bio or production story exists anywhere in the codebase).
**Fix:** Either write the actual founding story under that heading, or rename the section to match what it actually delivers (e.g. "What We Believe") and let a future "Behind the Paper" piece carry the real origin story.

### 3. One unused copy string signals an unshipped feature
**Evidence:** `common.sale: 'Special Price'` exists in both languages, but every product in `products.json` has `compareAt: 0` — no product ever uses it.
**Why it matters:** Not a customer-facing issue (it's simply never rendered), but it's a small signal worth flagging to whoever owns the pricing/promo roadmap — see the companion pricing doc's bundle/discount recommendations, which would be the first real use of this string.

### 4. The gsm story lives in copy but not at the decision point
**Evidence:** The best explanation of paper weight already exists — `trust.ecoDesc: 'From 150gsm drawing paper up to 320gsm mixed media sheets'` — but it's a homepage trust-row line, not something repeated on the shop grid or PDP where a buyer is actually choosing between two prices.
**This isn't a copy-quality problem** (the line itself is fine), **it's a placement problem** — see the pricing doc's recommendation #1 (visible weight-tier badges on shop cards) and content-strategy's "what does gsm mean" topic. The words already exist; they need to travel to where the buying decision happens.

---

## Not changing

- **Round-number pricing display** (already covered in the pricing doc) — no copywriting change needed here; this is a pricing-strategy call, not a copy one.
- **"Drops" language in the newsletter section** (`'Get first dibs on fresh batches & limited drops.'`) — read initially as a slight tonal mismatch (streetwear slang vs. handmade-craft brand), but on balance it fits the "warm & unintimidating" voice the About page explicitly states as a design goal, and pairs naturally with the genuinely true small-batch production model. Leaving as-is.

---

## Priority fixes

1. Swap the hero CTA to match the specificity of the featured-section CTA (`"Shop All 8 Sketchbooks"`).
2. Either write a real founding story under "Why We Started Waraqa," or rename the section.
3. Surface the gsm/paper-weight explanation at the shop-grid and PDP level, not just the homepage trust row (cross-reference: pricing doc §1).
4. No action needed on the unused `sale` string until a discount/bundle strategy ships (cross-reference: pricing doc §2–3).
