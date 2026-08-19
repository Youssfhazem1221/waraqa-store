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
4. Update the two configuration variables at the top:
   ```javascript
   const SHEET_ID   = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
   const ADMIN_TOKEN = 'CHOOSE_A_STRONG_RANDOM_PASSWORD';
   ```
5. Click the **Save** icon (💾) or press `Ctrl + S`.
6. Click **Deploy ▸ New deployment**:
   - **Click the gear icon (⚙️) next to "Select type" ▸ choose "Web app"**
   - **Description**: `Waraqa Store Backend v1`
   - **Execute as**: `Me (your_email@gmail.com)`
   - **Who has access**: `Anyone` *(Crucial: allows the website to post orders)*
7. Click **Deploy**.
8. If asked, click **"Authorize access"**, select your Google account, click **"Advanced"** (or "Go to Untitled project (unsafe)"), and click **"Allow"**.
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
2. Your store is now connected! Orders will directly append to your Google Sheet in real-time, stock will decrement automatically, and `/admin` will allow you to edit stock and manage orders.

---

## Part 4: (Optional) Google Cloud Console & Meta WhatsApp Cloud API

If you want to use Google Cloud Console for advanced OAuth or WhatsApp Cloud API auto-notifications:

### Optional: Google Cloud Project (for Custom OAuth or Service Accounts)
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a project ▸ New Project** (e.g. `waraqa-store-backend`).
3. If using Sheets API directly with a Service Account:
   - Go to **APIs & Services ▸ Library**
   - Search for **Google Sheets API** and click **Enable**
   - Go to **APIs & Services ▸ Credentials ▸ Create Credentials ▸ Service Account**
   - Download the JSON key file and share your Google Sheet with the generated service account email (`...@...gserviceaccount.com`).
*(Note: Google Apps Script Web App avoids all service account complexity and works 100% free with no server!)*

### Optional: Automatic WhatsApp Alerts (WhatsApp Cloud API)
In `waraqa-apps-script.gs`, there are placeholders for:
```javascript
const WA_TOKEN    = ''; // Meta WhatsApp Cloud API token
const WA_PHONE_ID = ''; // Phone Number ID from developers.facebook.com
const OWNER_WA    = '201069237525';
```
When configured, Google Apps Script will also auto-DM your phone on WhatsApp whenever an order is submitted!

---

## Part 5: Testing Your Setup

1. Open your browser and navigate to:
   `https://script.google.com/macros/s/YOUR_EXEC_ID/exec?what=products`
2. You should see a JSON response:
   ```json
   { "ok": true, "products": [ ... ] }
   ```
3. If you see this, your Google Apps Script backend is fully functional!
