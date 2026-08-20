# Waraqa (ورقة) — Pricing Strategy Notes

**Prepared:** 2026-08-20
**Scope note:** No sales/traffic/conversion data exists yet (pre-launch or pre-analytics) — these are structural recommendations based on the current catalog, stated brand values, and the marketplace comparison data gathered for the competitor-analysis doc, not A/B-tested conclusions. Treat as hypotheses to validate once there's order volume.

---

## Current pricing (from `src/data/products.json`)

| Product | GSM | Sheets | Price (EGP) |
|---|---|---|---|
| Mini Sketchbook 10.5×15cm | 200 | 40 | 120 |
| A5 Drawing Sketchbook | 150 | 50 | 160 |
| A5 Kraft Sketchbook | 180 | 40 | 180 |
| Large Sketchbook 25×35cm (dry media) | 150 | 20 | 180 |
| Square Sketchbook 25×25cm | 250 | 20 | 190 |
| A5 Sketchbook | 250 | 35 | 200 |
| A5 Mixed Media Sketchbook | 320 | 25 | 220 |
| A4 Mixed Media Sketchbook | 320 | 20 | 250 |

No `compareAt`/discount pricing is set on any SKU. No bundles or subscriptions exist. Free shipping kicks in at 800 EGP; flat shipping is 50 EGP below that.

---

## Findings & recommendations

### 1. The value metric (gsm) is real but invisible to non-expert buyers
Price scales sensibly with paper weight — but a customer has to already know what "gsm" means to see that logic. The buyer's-guide content already drafted (`marketing/competitors/waraqa-competitor-analysis.md`, Page B) explains gsm in plain terms; that same explanation should live on the shop grid and PDP, not just in a separate guide.
**Recommendation:** Add a visible weight-tier badge per product (e.g., "150gsm — everyday sketching" / "250–320gsm — ink, marker & wet media") directly on the shop grid card and PDP, so the price differential is self-explanatory at the point of decision.

### 2. Free-shipping threshold (800 EGP) is too high relative to basket size
With every SKU priced 120–250 EGP, a customer needs 3–4+ books in cart to reach free shipping — most single-item orders (the likely default for a first-time buyer) pay the full 50 EGP flat fee, which is a **+42% effective price increase** on the cheapest item (120 EGP mini).
**Recommendation:** Either lower the threshold to roughly 350–400 EGP (about two mid-tier books — genuinely reachable) or introduce a bundle priced just under it (see #3) so "add one more for free shipping" becomes a real, achievable prompt at checkout rather than a distant target.

### 3. No bundling despite a catalog that begs for a starter set
The buyer's-guide content already surfaces "which weight do I need?" as the #1 point of confusion for new sketchbook buyers. An explicit bundle solves both the indecision *and* the AOV/shipping-threshold problem at once.
**Recommendation:** A "Try All Three Weights" starter bundle (one 150gsm, one 250gsm, one 320gsm — e.g., A5 Drawing + A5 Sketchbook + A5 Mixed Media) at a modest ~10% discount to the sum (≈ 522 EGP at current prices) sits comfortably above a lowered free-shipping threshold and directly answers the "I don't know which one to buy" objection.

### 4. Keep round-number pricing — don't switch to charm pricing
Current prices (120, 160, 180, 190, 200, 220, 250) are round, not charm-priced (119, 179...). For most DTC brands charm pricing lifts conversion slightly, but Waraqa's stated brand value is explicitly **"Fair Pricing"** as part of an honest, anti-corporate positioning ("no glossy plastics or stiff corporate binders"). Round pricing reads as a flat, honest number; charm pricing reads as a discount tactic — the latter would work against the brand's own stated values.
**Recommendation:** Keep round pricing. This is a case where a common e-commerce tactic should be deliberately *not* applied because it conflicts with positioning — don't A/B test this one without flagging the brand-consistency tradeoff first.

### 5. One product's price isn't self-explanatory next to its neighbors
The Large Sketchbook (25×35cm, 150gsm, 20 sheets, dry media) is priced the same as the A5 Kraft (180gsm, 40 sheets) — 180 EGP. A buyer comparing gsm and sheet count alone would read the Large as "worse value," when the actual driver is sheet **area** (a 25×35cm sheet is roughly 5× the surface of an A5 sheet).
**Recommendation:** Add one explicit line to that product's description calling out sheet size as the value driver ("Nearly 5× the drawing surface of our A5 books, sheet for sheet") so the price doesn't read as inconsistent.

### 6. "Small-batch" is a stated value with no operational signal
Brand copy claims "Local Small Batches" but nothing on the site reflects genuine scarcity (no stock counts, no "restocking soon" states). Since the claim is apparently true (small-batch handmade production), there's low-risk upside in surfacing it honestly.
**Recommendation:** If inventory data supports it, show real low-stock indicators on the shop grid — only where genuinely true. Don't fabricate scarcity; the brand's credibility is built on honesty ("inspect before you pay"), and fake urgency would undercut that.

### 7. Competitive price positioning (cross-reference)
Per the competitor-analysis doc: Waraqa is *not* the cheapest option in Egypt, but is fully price-competitive once matched on paper weight against marketplace generic sketchbooks (e.g., Waraqa's 150gsm A5 at 160 EGP vs. Smart's 150gsm B4 at 155 EGP on Jumia). That comparison currently requires the buyer to do gsm math themselves across two different sites.
**Recommendation:** Surface the "heavier than most" claim directly on the shop grid (ties to #1's weight-tier badge) so the price-per-quality argument is made at the point of purchase, not only in a separate comparison article.

---

## Prioritized actions

1. Lower the free-shipping threshold or launch a starter bundle — the single highest-leverage change for AOV and cart-abandonment on shipping cost.
2. Add visible gsm/weight-tier badges to shop grid + PDP.
3. Add the sheet-size explainer line to the Large Sketchbook description.
4. Keep round-number pricing as-is; don't charm-price.
5. Once real order data exists, validate #1 and #2 with the `ab-testing` skill rather than shipping on hypothesis alone.
