# Waraqa — Google Sheets & Google Apps Script Backend Setup Guide

This guide walks you through setting up your free backend using **Google Sheets** and **Google Apps Script** (with optional Google Cloud integration if needed).

---

## Part 1: Setting up the Google Sheet

1. Open [Google Sheets](https://sheets.new) or [Google Drive](https://drive.google.com).
2. Click **File ▸ Import ▸ Upload** and upload `Waraqa-Orders-Database.xlsx` from your project folder.
3. Select **"Replace spreadsheet"** or **"Insert new sheet(s)"**.
4. You should see 5 tabs:
   - `① Setup` (instructions)
   - `② Products` (your 8 products catalog)
   - `③ Orders` (orders created by customers)
   - `④ Order_Items` (line items per order)
   - `⑤ Customers` (customer database)

> [!TIP]
> **Rename the tabs** to plain English names without the circle numbers if not already done:
> - `Products`
> - `Orders`
> - `Order_Items`
> - `Customers`

5. Copy your **Spreadsheet ID** from the browser URL:
   `https://docs.google.com/spreadsheets/d/`**`1a2b3c4d5e6f7g8h9...`**`/edit`
   *(The long string between `/d/` and `/edit` is your `SHEET_ID`)*.

---

## Part 2: Deploying the Google Apps Script Web App

1. In your Google Sheet, click **Extensions ▸ Apps Script**.
2. Delete any existing code in `Code.gs`.
3. Open `waraqa-apps-script.gs` from this project folder, copy all contents, and paste into the Apps Script editor.
4. Update the configuration variables at the top:
   ```javascript
   const SHEET_ID    = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
   const ADMIN_TOKEN = 'CHOOSE_A_STRONG_RANDOM_PASSWORD';

   // Order emails (free, sent from THIS account's Gmail — no extra services):
   const OWNER_EMAIL = 'youssf.hazem1221@gmail.com'; // where the new-order alert lands
   const STORE_NAME  = 'Waraqa';                     // email sender name
   const REPLY_TO    = 'youssf.hazem1221@gmail.com'; // customer replies go here
   const SUPPORT_WA  = '201069237525';               // shown in the receipt
   const SLA_HOURS   = 24;                            // "we'll confirm within N hours"
   ```
5. Click the **Save** icon (💾) or press `Ctrl + S`.
6. Click **Deploy ▸ New deployment**:
   - **Click the gear icon (⚙️) next to "Select type" ▸ choose "Web app"**
   - **Description**: `Waraqa Store Backend v1`
   - **Execute as**: `Me (your_email@gmail.com)` *(this account's Gmail is what sends the order emails)*
   - **Who has access**: `Anyone` *(Crucial: allows the website to post orders)*
7. Click **Deploy**.
8. If asked, click **"Authorize access"**, select your Google account, click **"Advanced"** (or "Go to Untitled project (unsafe)"), and click **"Allow"**. Because the script now sends email, the permission screen will also ask to **"Send email as you"** — approve it.
9. Copy the **Web App URL** ending in `/exec`:
   `https://script.google.com/macros/s/AKfycb.../exec`

---

## Part 3: Connecting to the Website

1. In `waraqa-store/.env.local` (or in your Vercel/Cloudflare/Netlify environment variables):
   ```env
   NEXT_PUBLIC_WEB_APP_URL=https://script.google.com/macros/s/AKfycb.../exec
   NEXT_PUBLIC_WHATSAPP_NUMBER=201069237525
   NEXT_PUBLIC_SHIPPING_FLAT=50
   NEXT_PUBLIC_FREE_SHIP_OVER=800
   NEXT_PUBLIC_CURRENCY=EGP
   ```
2. Your store is now connected! Orders will directly append to your Google Sheet in real-time, and stock will decrement automatically. Manage stock, products, and orders from the separate `waraqa-crm` app (same Web App URL and `ADMIN_TOKEN`).

> [!NOTE]
> `NEXT_PUBLIC_WHATSAPP_NUMBER` is only used for the **footer contact link** now — checkout no longer pushes customers into WhatsApp.

---

## Part 4: Order Emails (automatic, $0)

As soon as an order is placed, the Apps Script sends **two emails** — no extra services, no paid plan:

1. **Owner alert → `OWNER_EMAIL`** — a "New order WRQ-####" summary with the items, totals, and the customer's delivery details, so you know to reach out and confirm.
2. **Customer receipt → the email they entered at checkout** — a bilingual (English + Arabic) receipt that also tells them they'll get a confirmation by **email and WhatsApp** to go over details, delivery, and timing (SLA, `SLA_HOURS`).

Both are sent with Gmail's built-in `MailApp`, so they come **from the Google account that owns/deployed this script**. On a normal Gmail account you can send to ~100 recipients/day (plenty for a small shop); a Google Workspace account raises that limit. Nothing to configure beyond the config block in Part 2 — just make sure you approved the "Send email as you" permission when deploying.

### (Optional) Manage orders in AppSheet
AppSheet can sit on top of the **same Google Sheet** as a phone/tablet dashboard to view and update orders (flip status to Confirmed, etc.). It reads the same `Orders` tab — no code changes needed. Emails are already handled by the script above, so AppSheet is purely for order management.

---

## Part 5: Testing Your Setup

1. Open your browser and navigate to:
   `https://script.google.com/macros/s/YOUR_EXEC_ID/exec?what=products`
2. You should see a JSON response:
   ```json
   { "ok": true, "products": [ ... ] }
   ```
3. If you see this, your Google Apps Script backend is fully functional!
