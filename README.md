# Waraqa (ورقة) — E-commerce Storefront

A mobile-first, bilingual storefront (Egyptian Arabic under `/ar`, English under `/en`) for **Waraqa (ورقة)**, an Egyptian sketchbook & paper-goods brand. Live at [waraqa.art](https://waraqa.art).

---

## 🌟 Highlights

- **Next.js on Cloudflare Workers**: Next.js 16 App Router with TypeScript & Tailwind CSS v4, built with OpenNext (`@opennextjs/cloudflare`) and served by the `waraqa-store` Worker on waraqa.art. Pages that show prices render per request from a short-lived catalog cache (`src/lib/catalog.ts`).
- **Google Sheets Backend**: An Apps Script Web App (`waraqa-apps-script.gs`) serves the catalog from the Sheet and takes the orders.
- **Cash on Delivery, with an Emailed Receipt**: Checkout sends the order to Apps Script, which re-prices it against the Sheet, saves it, lowers stock and emails the customer a receipt (and the owner an alert). The team then confirms the details on WhatsApp before the order ships.
- **Bundled Catalog**: `src/data/products.json` builds the sitemap and the product pages and stands in only when the Sheet can't be reached. Live prices and stock come from the Sheet.
- **Managed via the standalone `waraqa-crm` app**: Inventory, orders, and customers are managed from the separate CRM project, which reads/writes the same Google Sheet backend.
- **Brand System Fidelity**: Reem Kufi (Arabic headlines) and Readex Pro (Arabic + English text, English headlines, UI) typography — see `../BRAND_GUIDELINES.md` — combined with Maroon (`#4C2224`), Espresso (`#201513`), Cream (`#F4ECE0`), Kraft (`#C0A286`), Sage, and Terracotta design tokens.

---

## 🚀 Quick Start (Local Run)

```bash
# 1. Enter store directory
cd waraqa-store

# 2. Install dependencies
npm install

# 3. Create .env.local from template
cp .env.example .env.local

# 4. Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to browse the storefront.

---

## ⚙️ Environment Variables

Set these in `.env.local` (the template, `.env.example`, explains each one). `NEXT_PUBLIC_*` values are compiled into the build, so set them before building or deploying.

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_WEB_APP_URL` | Apps Script `/exec` URL, for the catalog and orders | the production endpoint in `src/lib/constants.ts` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Owner WhatsApp number for the contact links (international format, Egypt `20...`) | `201069237525` |
| `NEXT_PUBLIC_SHIPPING_CAIRO` | Delivery fee in Cairo & Giza (EGP) | `60` |
| `NEXT_PUBLIC_SHIPPING_OUTSIDE` | Delivery fee to every other governorate (EGP) | `75` |
| `NEXT_PUBLIC_FREE_SHIP_OVER` | Subtotal from which Cairo & Giza delivery is free (EGP) | `800` |
| `NEXT_PUBLIC_CURRENCY` | Currency display text | `EGP` |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, the sitemap and robots.txt | `https://waraqa.art` |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | PostHog analytics; a blank key turns it off | unset |

The delivery fees and the free-delivery threshold must match the same constants in `waraqa-apps-script.gs`: the store quotes the fee, the backend charges it.

---

## 📦 Deployment (Cloudflare Workers)

`wrangler.jsonc` holds the Worker, its routes (waraqa.art and www.waraqa.art), the KV namespace for Next's cache and the Images binding.

```bash
npm run preview   # OpenNext build, then the Worker locally (wrangler)
npm run deploy    # OpenNext build, then deploy to Cloudflare
```

Both need Wrangler signed in to the Cloudflare account (`npx wrangler login`). `npm run build` alone is a plain Next.js build, handy for checking the app; it is not what the Worker serves.

Security headers (CSP, HSTS and the rest) come from `next.config.ts`; `public/_headers` covers the static files the Worker never sees.

---

## 🗄️ Google Sheets & Apps Script Setup

See [`GOOGLE_SHEETS_APPS_SCRIPT_GUIDE.md`](../GOOGLE_SHEETS_APPS_SCRIPT_GUIDE.md) for full instructions:
1. Upload `Waraqa-Orders-Database.xlsx` to Google Drive and open it with Google Sheets.
2. In the Google Sheet, open **Extensions ▸ Apps Script**, paste `waraqa-apps-script.gs` and set `SHEET_ID`.
3. In **Project Settings ▸ Script Properties**, add `ADMIN_TOKEN` (for the CRM) and, optionally, `NOTIFY_EMAILS` (more addresses for new-order alerts, comma-separated). Never type either into the file: this repo is public.
4. Deploy as Web App (Execute as: **Me**, Who has access: **Anyone**) and paste the `/exec` URL into `NEXT_PUBLIC_WEB_APP_URL`.
5. To ship a change later: **Deploy ▸ Manage deployments**, edit the existing Web App, Version: **New version**. A new deployment would change the `/exec` URL.

---

## 🔐 Admin Management

The storefront itself has no admin UI. Manage stock, product details, and orders from the standalone `waraqa-crm` app, using the same `ADMIN_TOKEN` and Web App URL configured in your Apps Script.
