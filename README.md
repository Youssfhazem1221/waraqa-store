# Waraqa (ورقة) — E-commerce Storefront

A production-quality, mobile-first, zero-backend e-commerce storefront for **Waraqa (ورقة)**, an Egyptian sketchbook & paper-goods brand.

---

## 🌟 Highlights

- **Static & Serverless**: Built on Next.js App Router with TypeScript & Tailwind CSS v4, statically exported for 100% free hosting (Vercel, Netlify, Cloudflare Pages).
- **Free Google Sheets Backend**: Reads and writes directly to Google Sheets via Google Apps Script Web App without CORS issues.
- **WhatsApp Order Confirmation**: Automatically formats complete order summaries and links directly to owner WhatsApp (`+20 106 923 7525`) for Cash on Delivery order handoffs.
- **Offline & Graceful Fallbacks**: Bundled `products.json` seed ensures the store functions flawlessly even if the backend is unreachable.
- **Managed via the standalone `waraqa-crm` app**: Inventory, orders, and customers are managed from the separate CRM project, which reads/writes the same Google Sheet backend.
- **Brand System Fidelity**: Fraunces (display), Inter (UI), and Tajawal (Arabic) typography combined with Maroon (`#4C2224`), Espresso (`#201513`), Cream (`#F4ECE0`), Kraft (`#C0A286`), Sage, and Terracotta design tokens.

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

Set the following in `.env.local` or in your static host's dashboard:

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_WEB_APP_URL` | Google Apps Script `/exec` URL | `""` (uses fallback JSON) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Owner WhatsApp number (international format, Egypt `20...`) | `201069237525` |
| `NEXT_PUBLIC_SHIPPING_FLAT` | Flat shipping rate across Egypt (EGP) | `50` |
| `NEXT_PUBLIC_FREE_SHIP_OVER` | Free shipping order threshold (EGP) | `800` |
| `NEXT_PUBLIC_CURRENCY` | Currency display text | `EGP` |

---

## 📦 Deployment to Vercel / Netlify / Cloudflare

### Static Export Build
```bash
npm run build
```
This generates a static `out/` folder containing pure HTML, CSS, and client-side JavaScript.

### Deploying to Vercel:
1. Connect your repository on [Vercel](https://vercel.com).
2. Framework Preset: **Next.js**.
3. Build Command: `npm run build`.
4. Output Directory: `out` (or leave default with Next.js).
5. Add your `NEXT_PUBLIC_*` environment variables.
6. Deploy!

---

## 🗄️ Google Sheets & Apps Script Setup

See [`GOOGLE_SHEETS_APPS_SCRIPT_GUIDE.md`](../GOOGLE_SHEETS_APPS_SCRIPT_GUIDE.md) for full instructions:
1. Upload `Waraqa-Orders-Database.xlsx` to Google Drive.
2. In the Google Sheet, open **Extensions ▸ Apps Script**.
3. Paste `waraqa-apps-script.gs` and update `SHEET_ID` and `ADMIN_TOKEN`.
4. Deploy as Web App with Access: **Anyone**.
5. Paste the `/exec` URL into `NEXT_PUBLIC_WEB_APP_URL`.

---

## 🔐 Admin Management

The storefront itself has no admin UI. Manage stock, product details, and orders from the standalone `waraqa-crm` app, using the same `ADMIN_TOKEN` and Web App URL configured in your Apps Script.
