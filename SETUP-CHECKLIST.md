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
- [ ] Type a password of your choice in `const ADMIN_TOKEN = '...'`.
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

### Step 5: Manage Orders on `/admin`
- [ ] Go to `https://your-store.com/admin`.
- [ ] Enter your password (`ADMIN_TOKEN`).
- [ ] Update stock levels or mark orders as Confirmed/Shipped/Delivered right from your phone!
