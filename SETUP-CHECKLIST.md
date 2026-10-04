# Waraqa Store — Non-Technical Owner Setup Checklist

Follow these 5 simple steps to get your online store live and receiving customer orders!

---

### Step 1: Upload Your Orders Database to Google Drive
- [ ] Go to [Google Drive](https://drive.google.com).
- [ ] Upload the file `Waraqa-Orders-Database.xlsx` from your project folder.
- [ ] Right-click the uploaded file and choose **Open with ▸ Google Sheets**.
- [ ] Copy the long ID from the browser link (between `/d/` and `/edit`).

---

### Step 2: Deploy Your Free Backend (Google Apps Script)
- [ ] In your Google Sheet, click **Extensions ▸ Apps Script**.
- [ ] Paste the code from `waraqa-apps-script.gs`.
- [ ] Paste your Sheet ID in `const SHEET_ID = '...'`.
- [ ] Create the admin token. **Do not type it into the code**: this repo is public.
  - Generate one on your computer: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`
  - In the Apps Script editor: **⚙ Project Settings ▸ Script Properties ▸ Add script property**, name `ADMIN_TOKEN`, value = what you just generated. Keep a copy in your password manager.
  - A random 32+ character token cannot be guessed. A short PIN works too (minimum 4 characters), but 5 wrong tries lock admin for an hour, and a PIN can still be found by an attacker over a few weeks.
  - If the CRM ever says admin is locked, run `resetAdminLockout` from the editor. If it keeps happening, someone is guessing: replace `ADMIN_TOKEN` with a new value.
- [ ] Click **Deploy ▸ New deployment ▸ Type: Web app**.
- [ ] Set **Who has access: Anyone** and click **Deploy**.
- [ ] Copy the generated Web App URL ending in `/exec`.

---

### Step 3: Configure Your Store Environment
- [ ] In `waraqa-store/.env.local` (or your hosting dashboard):
  - `NEXT_PUBLIC_WEB_APP_URL` = paste your `/exec` URL from Step 2.
  - `NEXT_PUBLIC_WHATSAPP_NUMBER` = `201069237525` (your WhatsApp number).

---

### Step 4: Test a Sample Order
- [ ] Open the store website.
- [ ] Add an item to your bag and go to checkout.
- [ ] Fill in test details and click **"Confirm & Buy"**.
- [ ] Confirm that:
  - [ ] A new row appeared in the **Orders** tab in Google Sheets.
  - [ ] Stock decremented in the **Products** tab.
  - [ ] WhatsApp opened with the pre-filled order summary addressed to `201069237525`.

---

### Step 5: Manage Orders in the Waraqa CRM
- [ ] Open the `waraqa-crm` app.
- [ ] In Settings, paste your Apps Script Web App URL and your `ADMIN_TOKEN` value.
  The CRM keeps the token only until you close the tab, so you sign in once per session.
- [ ] Update stock levels or mark orders as Confirmed/Shipped/Delivered right from your phone!
