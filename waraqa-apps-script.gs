/**
 * Waraqa (ورقة) — Unified Backend & CRM Engine on Google Sheets + Apps Script.
 *
 * HOW TO INSTALL / UPDATE
 * 1. Open the Google Sheet ▸ Extensions ▸ Apps Script.
 * 2. Select everything in Code.gs, delete it, paste this whole file, press Save.
 * 3. ONE TIME after installing this version: pick `setupSheet` in the function
 *    dropdown at the top ▸ Run (approve the permissions prompt if asked).
 *    It backs up the Orders and Customers tabs first, then repairs the sheet
 *    in place. Safe to run again any time — it never creates duplicates.
 *    View ▸ Logs (or "Execution log") shows what it changed.
 * 3b. ONE TIME: ⚙ Project Settings ▸ Script Properties ▸ Add script property:
 *    ADMIN_TOKEN = a random string of 32+ characters. The CRM is locked out
 *    until this exists (see ADMIN TOKEN below). Use the same value to sign in
 *    to the CRM.
 * 4. Deploy ▸ Manage deployments ▸ ✏️ (Edit) ▸ Version: "New version" ▸ Deploy.
 *    Do NOT use "New deployment": that issues a new /exec URL, and the
 *    storefront and CRM would keep calling the old code at the old URL.
 */

const SHEET_ID    = '1eeCP8SSIWg2V-gjzCjPpQOiPQelYnIXXOvNcjZPfSP0';   // from the sheet URL

/* ADMIN TOKEN — deliberately NOT in this file. The repo is public, and this
 * endpoint's URL ships in the storefront's JavaScript, so anyone can call it.
 * A short token here (it was a 4-digit PIN) can be guessed in minutes and
 * opens every customer's name, phone and address.
 *
 * Set it once in the Apps Script editor: ⚙ Project Settings ▸ Script
 * Properties ▸ Add script property ▸ name ADMIN_TOKEN, value = a random string
 * of at least 32 characters (see SETUP-CHECKLIST.md for a one-line generator).
 * Type the same value into the CRM. Admin calls are refused until it is set. */
const ADMIN_TOKEN_MIN_LENGTH = 32;
const AUTH_MAX_FAILURES      = 10;        // wrong tokens allowed, across all callers...
const AUTH_LOCK_SECONDS      = 15 * 60;   // ...within this window, before admin locks

/* Abuse limits for the two public actions. Apps Script cannot see a caller's
 * IP, so these are store-wide ceilings, set far above real traffic. Their job
 * is to stop a script from filling the sheet or using the daily email quota
 * (100/day on a free account) to send receipts to strangers. */
const ORDER_LIMIT_PER_10MIN     = 30;
const ORDER_LIMIT_PER_PHONE_HOUR = 5;
const SUBSCRIBE_LIMIT_PER_10MIN = 60;
const EMAIL_QUOTA_RESERVE       = 15;     // receipts stop here; owner alerts keep going

/* Longest value accepted per checkout field. Must match FIELD_MAX in the
 * storefront's src/lib/constants.ts, whose inputs stop typing at these. */
const FIELD_MAX = { name: 100, phone: 20, email: 254, governorate: 60, city: 80, address: 300, notes: 1000 };
const MAX_ORDER_LINES = 30;
const MAX_LINE_QTY    = 50;

/* ------------------------- STORE & NOTIFICATION CONFIG ------------------------- */
const OWNER_EMAIL = 'youssf.hazem1221@gmail.com'; // where new order alerts are sent
/* More people who should get the same new-order alert: add a script property
 * NOTIFY_EMAILS (⚙ Project Settings ▸ Script Properties), comma-separated.
 * Kept out of this file because the repo is public. Each extra address costs
 * one send from the daily email quota per order. */
const STORE_NAME  = 'Waraqa';                     // email sender name
const REPLY_TO    = 'youssf.hazem1221@gmail.com'; // customer replies land here
const CURRENCY    = 'EGP';
const SUPPORT_WA  = '201069237525';               // support WhatsApp in international format
const SLA_HOURS   = 24;                            // commitment window to confirm orders

/* Shipping is priced HERE, not by the client. Keep these in sync with
 * src/lib/constants.ts in the storefront — the storefront quotes the fee,
 * this decides it.
 *
 * Two zones: Cairo + Giza pay SHIPPING_CAIRO, everywhere else pays
 * SHIPPING_OUTSIDE. Free shipping over FREE_SHIP_OVER applies to the Cairo
 * zone ONLY — outside it the fee is always charged. */
const SHIPPING_CAIRO   = 60;   // Cairo + Giza courier fee in EGP
const SHIPPING_OUTSIDE = 75;   // all other governorates
const FREE_SHIP_OVER   = 800;  // Cairo-zone subtotal at which delivery is free
const CAIRO_ZONE       = ['cairo', 'giza'];

/* Business-day delivery window quoted to customers in the emails. */
const DELIVERY_DAYS_MIN = 3;
const DELIVERY_DAYS_MAX = 7;

/* When the CRM moves an order to Cancelled, put its items back on the shelf
 * (and take them off again if it is un-cancelled). "Returned" is NOT restocked
 * automatically — a returned book may be damaged, so recount it by hand. */
const RESTOCK_ON_CANCEL = true;

/* ------------------------- SHEET LAYOUT ------------------------- */
/* Every column is located by header name, never by position. The FIRST name
 * in each list is the canonical header (what setupSheet writes); the rest are
 * older spellings that are still recognised, so a renamed header can't make
 * the code silently skip a column again. Matching ignores case and spaces at
 * the ends. */

const PRODUCT_COLS = {
  sku:         ['SKU'],
  name:        ['Name (EN)', 'Name'],
  nameAr:      ['Name (AR)'],
  category:    ['Category'],
  size:        ['Size'],
  sheets:      ['Sheets'],
  gsm:         ['GSM'],
  paperType:   ['Paper Type', 'Paper feel'],
  price:       ['Price (EGP)', 'Price'],
  compareAt:   ['Compare-at (EGP)', 'Compare-at'],
  stock:       ['Stock', 'Quantity', 'Amount', 'In Stock', 'Qty'],
  status:      ['Status'],
  image:       ['Image filename', 'Image'],
  description: ['Short description', 'Description'],
  featured:    ['Featured?', 'Featured']
};

const ORDER_COLS = {
  id:       ['Order ID', 'Order #'],
  time:     ['Timestamp', 'Date'],
  name:     ['Customer name', 'Customer Name', 'Name'],
  phone:    ['Phone (WhatsApp)', 'Phone'],
  email:    ['Email'],
  gov:      ['Governorate/City', 'Governorate', 'City'],
  address:  ['Address'],
  summary:  ['Items summary', 'Items'],
  qty:      ['Total qty'],
  subtotal: ['Subtotal (EGP)', 'Subtotal'],
  shipping: ['Shipping (EGP)', 'Shipping'],
  total:    ['Total (EGP)', 'Total'],
  payment:  ['Payment'],
  status:   ['Status'],
  wa:       ['WhatsApp sent?', 'WhatsApp', 'WA Sent'],
  notes:    ['Notes']
};

const ITEM_COLS = {
  id:    ['Order ID'],
  sku:   ['SKU'],
  name:  ['Product name', 'Name'],
  qty:   ['Qty', 'Quantity'],
  price: ['Unit price (EGP)', 'Unit price', 'Price'],
  line:  ['Line total (EGP)', 'Line total']
};

const CUSTOMER_COLS = {
  phone: ['Phone (WhatsApp)', 'Phone'],
  name:  ['Customer Name', 'Name', 'Customer name'],
  email: ['Email'],
  addr:  ['Delivery Address', 'Default address', 'Address'],
  date:  ['First Order Date', 'First order', 'First Order', 'Date'],
  count: ['Total Orders', 'Orders count', 'Orders'],
  spent: ['Total Spent (EGP)', 'Total Spent'],
  tag:   ['Customer Tag', 'Tags', 'Tag'],
  notes: ['Notes']
};

/* Tags the script sets on its own, in rank order. Any other tag (e.g. "Risk")
 * was set by a person and is never overwritten. Automatic tags only ever move
 * up, so a VIP stays VIP if one of their orders is later cancelled. */
const AUTO_TAG_RANK = { 'New': 0, 'Active': 1, 'Repeat': 2, 'VIP': 3 };

/* ------------------------- BASICS ------------------------- */

function ss(){ return SpreadsheetApp.openById(SHEET_ID); }

/* Resolve a tab by name, tolerating emoji/number prefixes, spaces, and case differences */
function sheet(name){
  var book = ss();
  var direct = book.getSheetByName(name);
  if (direct) return direct;
  var norm = function(s){ return String(s).toLowerCase().replace(/[^a-z0-9]/g, ''); };
  var target = norm(name);
  var all = book.getSheets();
  for (var i = 0; i < all.length; i++){
    if (norm(all[i].getName()) === target) return all[i];
  }
  return null;
}

function json(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ------------------------- SECURITY ------------------------- */

function sha256Hex(s){
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8)
    .map(function(b){ return ('0' + (b & 0xff).toString(16)).slice(-2); })
    .join('');
}

/* Compares digests, not the tokens, so the time taken does not depend on how
 * many leading characters of a guess were right. */
function tokenMatches(given, expected){
  var a = sha256Hex(given), b = sha256Hex(expected), diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* null when the token is good, otherwise the error to return. "unauthorized"
 * is the exact string the CRM checks for; the other two it shows as-is. */
function adminAuthError(token){
  var expected = PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN') || '';
  if (expected.length < ADMIN_TOKEN_MIN_LENGTH) {
    return 'Admin is disabled: set an ADMIN_TOKEN script property of at least ' + ADMIN_TOKEN_MIN_LENGTH + ' characters (Apps Script ▸ Project Settings).';
  }
  var cache = CacheService.getScriptCache();
  var failures = Number(cache.get('auth_failures') || 0);
  if (failures >= AUTH_MAX_FAILURES) {
    return 'Too many wrong tokens. Admin is locked for 15 minutes.';
  }
  if (typeof token === 'string' && token && tokenMatches(token, expected)) return null;
  cache.put('auth_failures', String(failures + 1), AUTH_LOCK_SECONDS);
  return 'unauthorized';
}

/* Run from the editor if the CRM says admin is locked and it was not you
 * guessing: it clears the counter. If it keeps happening, rotate ADMIN_TOKEN. */
function resetAdminLockout(){
  CacheService.getScriptCache().remove('auth_failures');
}

/* Fixed-window counter in the script cache. Returns false once `limit` hits
 * have been counted for `key` in the current window. Caller holds the lock. */
function underLimit(key, limit, seconds){
  var cache = CacheService.getScriptCache();
  var bucket = 'rl_' + key + '_' + Math.floor(Date.now() / (seconds * 1000));
  var n = Number(cache.get(bucket) || 0);
  if (n >= limit) return false;
  cache.put(bucket, String(n + 1), seconds);
  return true;
}

/* Customer text going into a cell. Sheets evaluates any value that starts with
 * = + - or @ as a formula, so a "name" like =IMPORTXML("https://…", …) would
 * run inside the owner's sheet and could send its contents to that URL. A
 * leading apostrophe stores the text as text and is not displayed. Control
 * characters are dropped and the length is capped. */
function cleanText(v, max){
  var s = String(v == null ? '' : v)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
  return sheetSafe(s);
}

/* The apostrophe guard on its own, for every text write. It has to be applied
 * again whenever a value is copied from one cell to another: getValues()
 * returns the text WITHOUT the apostrophe, so customer text read back from
 * Orders and written to Customers would turn back into a live formula. Numbers,
 * dates and already-guarded text pass through unchanged. */
function sheetSafe(v){
  return (typeof v === 'string' && /^[=+\-@\t\r]/.test(v)) ? "'" + v : v;
}

function findCol(head, aliases){
  for (var i = 0; i < head.length; i++){
    var h = String(head[i]).toLowerCase().trim();
    for (var j = 0; j < aliases.length; j++){
      if (h === aliases[j].toLowerCase().trim()) return i;
    }
  }
  return -1;
}

/* { key: column index or -1 } for every column in a layout. */
function colMap(head, spec){
  var m = {};
  for (var k in spec) m[k] = findCol(head, spec[k]);
  return m;
}

function headerOf(s){
  var lastCol = s.getLastColumn();
  return lastCol ? s.getRange(1, 1, 1, lastCol).getValues()[0] : [];
}

/* Grow the grid if needed — writing outside it throws in Apps Script. */
function ensureSize(s, rows, cols){
  if (s.getMaxRows() < rows) s.insertRowsAfter(s.getMaxRows(), rows - s.getMaxRows());
  if (s.getMaxColumns() < cols) s.insertColumnsAfter(s.getMaxColumns(), cols - s.getMaxColumns());
}

/* Append any column of the layout that the tab is missing (canonical name, at
 * the end) and return the resulting header row. Existing columns are untouched. */
function ensureCols(s, spec){
  var head = headerOf(s);
  var missing = [];
  for (var k in spec){
    if (findCol(head, spec[k]) < 0) missing.push(spec[k][0]);
  }
  if (missing.length){
    ensureSize(s, 1, head.length + missing.length);
    s.getRange(1, head.length + 1, 1, missing.length).setValues([missing]);
    head = head.concat(missing);
  }
  return head;
}

/* A full-width row for appendRow, filled from { layoutKey: value }. */
function buildRow(head, spec, values){
  var row = head.map(function(){ return ''; });
  for (var k in values){
    var c = spec[k] ? findCol(head, spec[k]) : -1;
    if (c >= 0) row[c] = sheetSafe(values[k]);
  }
  return row;
}

/* The whole tab plus its column map. Returns null when the tab doesn't exist. */
function readTable(name, spec){
  var s = sheet(name);
  if (!s) return null;
  var data = s.getDataRange().getValues();
  var head = data.length ? data[0] : [];
  return { s: s, data: data, head: head, col: colMap(head, spec) };
}

function cellOf(row, c){ return c >= 0 ? row[c] : ''; }

function toDate(v){
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (!v) return null;
  var d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

/* ------------------------- PHONE NUMBERS ------------------------- */
/* One canonical form for every Egyptian mobile: 01XXXXXXXXX (11 digits).
 * Accepts +20…, 0020…, 20…, 0…, Arabic-Indic digits, and the 10-digit number
 * Sheets leaves behind after it eats the leading zero. This same value is both
 * what gets stored and what customers are matched on, so one person is one
 * customer no matter how they typed their number. Anything that isn't an
 * Egyptian mobile is kept as bare digits. */
function canonPhone(v){
  var d = String(v == null ? '' : v)
    .replace(/[٠-٩]/g, function(ch){ return String(ch.charCodeAt(0) - 0x0660); })
    .replace(/[۰-۹]/g, function(ch){ return String(ch.charCodeAt(0) - 0x06F0); })
    .replace(/\D/g, '');
  if (d.length >= 10){
    var last10 = d.slice(-10);
    if (/^1[0125]\d{8}$/.test(last10)) return '0' + last10;
  }
  return d;
}

/* Write a value as plain text so Sheets can't turn 01022320257 into 1022320257. */
function setText(s, row, col, value){
  s.getRange(row, col).setNumberFormat('@').setValue(String(value == null ? '' : value));
}

/* ------------------------- SHIPPING ------------------------- */

/* The storefront sends a governorate, but the Orders sheet stores it joined
 * with the city ("Cairo · Nasr City"), so match on the leading segment and
 * tolerate the Arabic spellings a customer or the CRM might supply. */
function isCairoZone(governorate){
  var g = String(governorate || '').split('·')[0].split(',')[0].trim().toLowerCase();
  if (!g) return false;
  if (g === 'القاهرة' || g === 'الجيزة') return true;
  for (var i = 0; i < CAIRO_ZONE.length; i++){
    if (g === CAIRO_ZONE[i]) return true;
  }
  return false;
}

function shippingFor(subtotal, governorate){
  if (!isCairoZone(governorate)) return SHIPPING_OUTSIDE;
  return Number(subtotal) >= FREE_SHIP_OVER ? 0 : SHIPPING_CAIRO;
}

/* ------------------------- READ ENDPOINTS (Storefront & CRM) ------------------------- */
function doGet(e){
  try {
    var p = (e && e.parameter) || {};
    var what = p.what || 'products';

    // Public catalog endpoint (Storefront)
    if (what === 'products') {
      return json({ ok: true, products: readProducts() });
    }

    // Admin-authenticated CRM endpoints
    var authError = adminAuthError(p.token);
    if (authError) return json({ ok: false, error: authError });

    if (what === 'orders') {
      return json({ ok: true, orders: readSheet('Orders'), orderItems: readSheet('Order_Items') });
    }

    if (what === 'customers') {
      return json({ ok: true, customers: readSheet('Customers') });
    }

    if (what === 'analytics') {
      return json({ ok: true, analytics: calculateAnalytics() });
    }

    return json({ ok: false, error: 'unknown "what"' });
  } catch (err) {
    // Without this an exception returns Google's HTML error page, which the
    // CRM can't parse and silently treats as "offline".
    Logger.log('doGet error: ' + err);
    // The message can carry sheet or column names; it is logged, not returned.
    return json({ ok: false, error: 'server error' });
  }
}

/* Expose products cleanly for both storefront and CRM. */
function readProducts(){
  var t = readTable('Products', PRODUCT_COLS);
  if (!t || t.data.length < 2) return [];
  var col = t.col;
  var skuC = col.sku >= 0 ? col.sku : 0;

  return t.data.slice(1).filter(function(r){ return String(r[skuC]).trim() !== ''; }).map(function(r){
    var featured = String(cellOf(r, col.featured)).toLowerCase();
    return {
      sku: String(r[skuC]).trim(),
      name: cellOf(r, col.name) || '',
      nameAr: cellOf(r, col.nameAr) || '',
      category: cellOf(r, col.category) || 'Sketchbooks',
      size: cellOf(r, col.size) || 'A5',
      sheets: Number(cellOf(r, col.sheets)) || 0,
      gsm: Number(cellOf(r, col.gsm)) || 0,
      paperType: cellOf(r, col.paperType) || '',
      price: Number(cellOf(r, col.price)) || 0,
      compareAt: Number(cellOf(r, col.compareAt)) || 0,
      stock: Number(cellOf(r, col.stock)) || 0,
      status: cellOf(r, col.status) || 'Active',
      image: cellOf(r, col.image) || '',
      description: cellOf(r, col.description) || '',
      featured: featured === 'yes' || featured === 'true'
    };
  });
}

/* ------------------------- WRITE ENDPOINTS (Storefront & CRM) ------------------------- */
function doPost(e){
  var body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch(err){
    return json({ ok: false, error: 'bad json' });
  }

  var action = body.action;
  var isPublic = action === 'createOrder' || action === 'subscribe';

  // Admin-authenticated CRM actions
  if (!isPublic) {
    var authError = adminAuthError(body.token);
    if (authError) return json({ ok: false, error: authError });
  }

  // Every write runs under one lock. Before, only new orders were locked, so a
  // CRM edit could interleave with an order's stock decrement and one of the
  // two changes would be lost, or a row deletion could shift the row another
  // write was about to touch.
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return json({ ok: false, error: 'The store is busy right now. Please try again in a moment.' });
  }

  try {
    // Counted inside the lock so concurrent requests cannot both read the same
    // count and slip past the ceiling together.
    if (action === 'createOrder' && !underLimit('order', ORDER_LIMIT_PER_10MIN, 600)) {
      return json({ ok: false, error: 'We are receiving a lot of orders right now. Please try again in a few minutes.' });
    }
    if (action === 'subscribe' && !underLimit('subscribe', SUBSCRIBE_LIMIT_PER_10MIN, 600)) {
      return json({ ok: false, error: 'Please try again in a few minutes.' });
    }
    if (action === 'createOrder')       return createOrder(body);
    if (action === 'subscribe')         return subscribeEmail(body);
    if (action === 'updateStock')       return updateStock(body);
    if (action === 'saveProduct')       return saveProduct(body);
    if (action === 'deleteProduct')     return deleteProduct(body);
    if (action === 'updateOrderStatus') return updateOrderStatus(body);
    if (action === 'updateCustomer')    return updateCustomer(body);
    if (action === 'logWhatsApp')       return logWhatsApp(body);
    return json({ ok: false, error: 'unknown action' });
  } catch (err) {
    Logger.log(action + ' error: ' + err + (err && err.stack ? '\n' + err.stack : ''));
    if (action === 'createOrder') {
      return json({ ok: false, error: 'We could not place your order just now. Please try again in a moment.' });
    }
    return json({ ok: false, error: 'server error: ' + (err && err.message || err) });
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

/* Create a new customer order from storefront. Runs inside doPost's lock. */
function createOrder(body){
  var rawC = (body.customer && typeof body.customer === 'object') ? body.customer : {};
  var rawItems = Array.isArray(body.items) ? body.items : [];
  if (!rawItems.length) return json({ ok: false, error: 'Your cart is empty.' });
  if (rawItems.length > MAX_ORDER_LINES) return json({ ok: false, error: 'Too many different items in one order.' });

  // The same checks the checkout form runs (src/app/[locale]/checkout/page.tsx),
  // repeated here because this endpoint can be called without the form. Keep
  // them no stricter than the form, or real orders get refused.
  var str = function(v){ return String(v == null ? '' : v).trim(); };
  var name = str(rawC.name), email = str(rawC.email), gov = str(rawC.governorate),
      city = str(rawC.city), address = str(rawC.address), notesIn = str(body.notes);
  var phone = canonPhone(rawC.phone);
  if (!name || name.length > FIELD_MAX.name) return json({ ok: false, error: 'Please enter your name.' });
  if (!/^01[0125]\d{8}$/.test(phone) || str(rawC.phone).length > FIELD_MAX.phone) {
    return json({ ok: false, error: 'Please enter a valid Egyptian mobile number.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > FIELD_MAX.email) {
    return json({ ok: false, error: 'Please enter a valid email address.' });
  }
  if (!gov || gov.length > FIELD_MAX.governorate) return json({ ok: false, error: 'Please choose your governorate.' });
  if (!address || address.length > FIELD_MAX.address) return json({ ok: false, error: 'Please enter your address.' });
  if (city.length > FIELD_MAX.city || notesIn.length > FIELD_MAX.notes) {
    return json({ ok: false, error: 'One of the fields is too long.' });
  }
  if (!underLimit('order_' + phone, ORDER_LIMIT_PER_PHONE_HOUR, 3600)) {
    return json({ ok: false, error: 'We already have several orders from this number. Please WhatsApp us to add to them.' });
  }

  // Everything below writes these cleaned values, never the raw request.
  var c = {
    name: cleanText(name, FIELD_MAX.name),
    phone: phone,
    email: cleanText(email, FIELD_MAX.email),
    governorate: cleanText(gov, FIELD_MAX.governorate),
    city: cleanText(city, FIELD_MAX.city),
    address: cleanText(address, FIELD_MAX.address)
  };
  var notes = cleanText(notesIn, FIELD_MAX.notes);
  // Cash on delivery is the only method; a client-sent string is not trusted.
  var payment = 'Cash on delivery';

  // createOrder is a public, unauthenticated endpoint — never trust the
  // price/name a client sends. Re-price every line against the live
  // Products sheet by SKU so a tampered request can't under/over-charge.
  var catalog = {};
  readProducts().forEach(function(p){ catalog[String(p.sku)] = p; });

  var items = [];
  for (var idx = 0; idx < rawItems.length; idx++){
    var ri = rawItems[idx];
    var product = catalog[String(ri.sku).trim()];
    if (!product) return json({ ok: false, error: 'One of the items in your cart is no longer available. Please refresh and try again.' });
    var qty = Math.floor(Number(ri.qty));
    if (!qty || qty <= 0 || qty > MAX_LINE_QTY) return json({ ok: false, error: 'Invalid quantity for ' + product.name + '.' });

    // Never accept an order for more than we hold.
    var available = Number(product.stock) || 0;
    if (String(product.status) === 'Hidden' || available <= 0) {
      return json({ ok: false, error: product.name + ' just sold out. Please remove it from your bag and try again.' });
    }
    if (qty > available) {
      return json({ ok: false, error: 'Only ' + available + ' left of ' + product.name + '. Please lower the quantity and try again.' });
    }

    items.push({ sku: product.sku, name: product.name, qty: qty, price: product.price });
  }

  var o = sheet('Orders');
  if (!o) throw new Error('Orders tab not found');
  var oHead = ensureCols(o, ORDER_COLS);

  var orderId = nextOrderId(o, oHead);
  var now = Utilities.formatDate(new Date(), 'GMT+2', 'yyyy-MM-dd HH:mm');
  var totalQty = items.reduce(function(s, i){ return s + Number(i.qty); }, 0);
  var subtotal = items.reduce(function(s, i){ return s + (Number(i.qty) * Number(i.price)); }, 0);
  // Shipping is recomputed here for the same reason prices are: body.shipping
  // arrives from an unauthenticated client.
  var shipping = shippingFor(subtotal, c.governorate);
  var total = subtotal + shipping;
  var summary = items.map(function(i){ return i.name + ' ×' + i.qty; }).join(', ');
  var govCity = (c.governorate || '') + (c.city ? ' · ' + c.city : '');

  o.appendRow(buildRow(oHead, ORDER_COLS, {
    id: orderId,
    time: now,
    name: c.name || '',
    phone: '',                       // written as text just below
    email: c.email || '',
    gov: govCity,
    address: c.address || '',
    summary: summary,
    qty: totalQty,
    subtotal: subtotal,
    shipping: shipping,
    total: total,
    payment: payment,
    status: 'Pending',
    wa: 'No',
    notes: notes
  }));
  setText(o, o.getLastRow(), findCol(oHead, ORDER_COLS.phone) + 1, phone);

  var oi = sheet('Order_Items');
  if (oi) {
    var iHead = ensureCols(oi, ITEM_COLS);
    items.forEach(function(i){
      oi.appendRow(buildRow(iHead, ITEM_COLS, {
        id: orderId, sku: i.sku, name: i.name, qty: i.qty, price: i.price,
        line: Number(i.qty) * Number(i.price)
      }));
    });
  }

  adjustStock(items, -1);
  refreshCustomer(phone);

  // The receipt goes to the address as typed (validated above); c.email may
  // carry the sheet's leading-apostrophe guard.
  var order = { orderId: orderId, now: now, c: c, to: email, items: items, subtotal: subtotal, shipping: shipping, total: total, payment: payment, notes: notes };
  try { sendOwnerEmail(order); }      catch(err){ Logger.log('Owner email error: ' + err); }
  // Keep the last few sends of the day for owner alerts: a burst of receipts
  // must never be what stops the owner hearing about orders.
  if (MailApp.getRemainingDailyQuota() > EMAIL_QUOTA_RESERVE) {
    try { sendCustomerReceipt(order); }  catch(err){ Logger.log('Customer receipt error: ' + err); }
  } else {
    Logger.log('Receipt skipped for ' + orderId + ': daily email quota is low.');
  }

  return json({ ok: true, orderId: orderId, total: total, subtotal: subtotal, shipping: shipping });
}

/* Newsletter signup from the storefront footer/home section.
 * Writes to a "Newsletter" tab, creating it on first use. Re-subscribing the
 * same address is a no-op rather than a duplicate row. Runs inside doPost's lock. */
function subscribeEmail(body){
  var email = String((body.email || '')).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > FIELD_MAX.email) {
    return json({ ok: false, error: 'invalid email' });
  }

  var s = sheet('Newsletter');
  if (!s) {
    s = ss().insertSheet('Newsletter');
    s.appendRow(['Email', 'Date', 'Locale', 'Source']);
    s.setFrozenRows(1);
  }

  var last = s.getLastRow();
  if (last >= 2) {
    var existing = s.getRange(2, 1, last - 1, 1).getValues();
    for (var i = 0; i < existing.length; i++){
      if (String(existing[i][0]).trim().toLowerCase() === email) {
        return json({ ok: true, alreadySubscribed: true });
      }
    }
  }

  s.appendRow([
    cleanText(email, FIELD_MAX.email),
    Utilities.formatDate(new Date(), 'GMT+2', 'yyyy-MM-dd HH:mm'),
    body.locale === 'ar' ? 'ar' : 'en',
    cleanText(body.source || 'storefront', 40)
  ]);

  return json({ ok: true });
}

/* Highest existing WRQ number + 1. Reading only the last row broke as soon
 * as the tab was sorted or filtered. */
function nextOrderId(o, head){
  var idC = findCol(head, ORDER_COLS.id);
  var last = o.getLastRow();
  var max = 1000;
  if (idC >= 0 && last >= 2){
    o.getRange(2, idC + 1, last - 1, 1).getValues().forEach(function(r){
      var n = parseInt(String(r[0]).replace(/\D/g, ''), 10);
      if (!isNaN(n) && n > max) max = n;
    });
  }
  return 'WRQ-' + (max + 1);
}

/* Move stock for a list of { sku, qty }: sign -1 sells, +1 puts back.
 * Keeps Status in step: 0 left ▸ "Out of stock", back above 0 ▸ "Active". */
function adjustStock(items, sign){
  var t = readTable('Products', PRODUCT_COLS);
  if (!t || t.col.sku < 0 || t.col.stock < 0) return;
  var col = t.col;

  items.forEach(function(it){
    for (var r = 1; r < t.data.length; r++){
      if (String(t.data[r][col.sku]).trim() !== String(it.sku).trim()) continue;
      var current = Number(t.data[r][col.stock]) || 0;
      var next = Math.max(0, current + sign * Number(it.qty));
      t.data[r][col.stock] = next;   // so two lines of the same SKU add up
      t.s.getRange(r + 1, col.stock + 1).setValue(next);
      if (col.status >= 0) {
        var status = String(t.data[r][col.status]);
        if (next === 0 && status !== 'Hidden') {
          t.s.getRange(r + 1, col.status + 1).setValue('Out of stock');
          t.data[r][col.status] = 'Out of stock';
        } else if (next > 0 && status === 'Out of stock') {
          t.s.getRange(r + 1, col.status + 1).setValue('Active');
          t.data[r][col.status] = 'Active';
        }
      }
      break;
    }
  });
}

/* ------------------------- CUSTOMERS ------------------------- */
/* The Customers tab is derived from Orders: one row per phone number, with
 * order count, spend and first-order date computed from the orders
 * themselves. Name, email, address, tag and notes typed by hand are kept.
 *
 *   Total Orders       = orders that are not Cancelled
 *   Total Spent (EGP)  = totals of orders that are neither Cancelled nor Returned
 */

function customerStatsFromOrders(t){
  var by = {};
  if (!t) return by;
  var col = t.col;
  if (col.phone < 0) return by;

  for (var r = 1; r < t.data.length; r++){
    var row = t.data[r];
    if (String(cellOf(row, col.id)).trim() === '') continue;
    var key = canonPhone(row[col.phone]);
    if (!key) continue;

    var status = String(cellOf(row, col.status) || 'Pending');
    var x = by[key] || (by[key] = { phone: key, name: '', email: '', addr: '', first: null, count: 0, spent: 0 });

    if (status !== 'Cancelled') x.count++;
    if (status !== 'Cancelled' && status !== 'Returned') x.spent += Number(cellOf(row, col.total)) || 0;

    var when = toDate(cellOf(row, col.time));
    if (when && (!x.first || when < x.first)) x.first = when;

    // Later rows are newer orders, so their contact details win.
    var name = String(cellOf(row, col.name) || '').trim();
    var email = String(cellOf(row, col.email) || '').trim();
    var gov = String(cellOf(row, col.gov) || '').trim();
    var address = String(cellOf(row, col.address) || '').trim();
    if (name) x.name = name;
    if (email) x.email = email;
    if (gov || address) x.addr = gov && address ? gov + ' — ' + address : gov || address;
  }
  return by;
}

function autoTag(count){ return count >= 3 ? 'VIP' : count >= 2 ? 'Repeat' : 'New'; }

function mergeTag(current, count){
  var auto = autoTag(count);
  current = String(current || '').trim();
  if (!current) return auto;
  if (!(current in AUTO_TAG_RANK)) return current;   // set by a person — leave it
  return AUTO_TAG_RANK[current] >= AUTO_TAG_RANK[auto] ? current : auto;
}

/* Bring one customer's row up to date with the Orders tab (create it if new). */
function refreshCustomer(phoneRaw){
  var key = canonPhone(phoneRaw);
  if (!key) return;
  var st = customerStatsFromOrders(readTable('Orders', ORDER_COLS))[key];
  if (!st) return;

  var s = sheet('Customers');
  if (!s) { rebuildCustomers(); return; }
  var head = ensureCols(s, CUSTOMER_COLS);
  var col = colMap(head, CUSTOMER_COLS);
  var data = s.getDataRange().getValues();

  for (var r = 1; r < data.length; r++){
    if (canonPhone(data[r][col.phone]) !== key) continue;
    var row = r + 1;
    var cur = data[r];
    if (String(cur[col.phone]) !== key) setText(s, row, col.phone + 1, key);
    s.getRange(row, col.count + 1).setValue(st.count);
    s.getRange(row, col.spent + 1).setValue(st.spent);
    s.getRange(row, col.tag + 1).setValue(mergeTag(cur[col.tag], st.count));
    // Only fill details that are blank — an operator's correction wins.
    if (!String(cur[col.name]).trim() && st.name)   s.getRange(row, col.name + 1).setValue(sheetSafe(st.name));
    if (!String(cur[col.email]).trim() && st.email) s.getRange(row, col.email + 1).setValue(sheetSafe(st.email));
    if (!String(cur[col.addr]).trim() && st.addr)   s.getRange(row, col.addr + 1).setValue(sheetSafe(st.addr));
    if (!String(cur[col.date]).trim() && st.first)  s.getRange(row, col.date + 1).setValue(st.first).setNumberFormat('yyyy-mm-dd');
    return;
  }

  s.appendRow(buildRow(head, CUSTOMER_COLS, {
    phone: '',                        // written as text just below
    name: st.name, email: st.email, addr: st.addr,
    date: st.first || '', count: st.count, spent: st.spent,
    tag: autoTag(st.count), notes: ''
  }));
  var newRow = s.getLastRow();
  setText(s, newRow, col.phone + 1, key);
  if (st.first) s.getRange(newRow, col.date + 1).setNumberFormat('yyyy-mm-dd');
}

/* Rewrite the whole Customers tab from Orders. Merges rows that were split by
 * phone formatting, renames headers to the canonical names, keeps hand-typed
 * tags and notes, keeps customers who have no orders, and carries any extra
 * columns you added yourself. Returns a short summary. */
function rebuildCustomers(){
  var stats = customerStatsFromOrders(readTable('Orders', ORDER_COLS));

  var s = sheet('Customers') || ss().insertSheet('Customers');
  var data = s.getDataRange().getValues();
  var head = data.length && String(data[0].join('')).trim() ? data[0] : [];
  var col = colMap(head, CUSTOMER_COLS);

  var known = {};
  for (var k in col) if (col[k] >= 0) known[col[k]] = true;
  var extras = [];
  head.forEach(function(h, i){ if (!known[i] && String(h).trim() !== '') extras.push(i); });

  // What the tab holds today, by phone. Rows that turn out to be the same
  // person (the old leading-zero bug) are merged here.
  var existing = {};
  var order = [];
  var merged = 0;
  for (var r = 1; r < data.length; r++){
    var row = data[r];
    var key = canonPhone(cellOf(row, col.phone));
    if (!key) continue;
    var rec = {
      name: cellOf(row, col.name), email: cellOf(row, col.email), addr: cellOf(row, col.addr),
      date: cellOf(row, col.date), count: cellOf(row, col.count), spent: cellOf(row, col.spent),
      tag: String(cellOf(row, col.tag) || '').trim(), notes: String(cellOf(row, col.notes) || '').trim(),
      extras: extras.map(function(i){ return row[i]; })
    };
    if (!existing[key]) { existing[key] = rec; order.push(key); continue; }
    merged++;
    var ex = existing[key];
    ['name', 'email', 'addr', 'date'].forEach(function(f){ if (!String(ex[f]).trim()) ex[f] = rec[f]; });
    if (rec.notes && ex.notes.indexOf(rec.notes) < 0) ex.notes = ex.notes ? ex.notes + ' | ' + rec.notes : rec.notes;
    if (!(rec.tag in AUTO_TAG_RANK) && rec.tag) ex.tag = rec.tag;   // a manual tag on either row survives
    else if ((ex.tag in AUTO_TAG_RANK || !ex.tag) && rec.tag in AUTO_TAG_RANK && AUTO_TAG_RANK[rec.tag] > (AUTO_TAG_RANK[ex.tag] || 0)) ex.tag = rec.tag;
  }
  for (var sk in stats) if (!existing[sk]) order.push(sk);

  var canonical = [];
  for (var ck in CUSTOMER_COLS) canonical.push(CUSTOMER_COLS[ck][0]);
  var header = canonical.concat(extras.map(function(i){ return head[i]; }));

  var rows = order.map(function(key){
    var st = stats[key];
    var ex = existing[key] || { name: '', email: '', addr: '', date: '', count: '', spent: '', tag: '', notes: '', extras: extras.map(function(){ return ''; }) };
    var base = st
      ? [key,
         String(ex.name || '').trim() || st.name,
         String(ex.email || '').trim() || st.email,
         String(ex.addr || '').trim() || st.addr,
         st.first || toDate(ex.date) || '',
         st.count, st.spent,
         mergeTag(ex.tag, st.count),
         ex.notes]
      : [key, ex.name, ex.email, ex.addr, toDate(ex.date) || ex.date || '', ex.count, ex.spent, ex.tag, ex.notes];
    return base.concat(ex.extras);
  });

  s.clearContents();
  ensureSize(s, rows.length + 1, header.length);
  s.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
  s.setFrozenRows(1);
  if (s.getMaxRows() > 1) s.getRange(2, 1, s.getMaxRows() - 1, 1).setNumberFormat('@');
  if (rows.length){
    s.getRange(2, 1, rows.length, header.length)
      .setValues(rows.map(function(r){ return r.map(sheetSafe); }));
    s.getRange(2, findCol(header, CUSTOMER_COLS.date) + 1, rows.length, 1).setNumberFormat('yyyy-mm-dd');
  }

  return rows.length + ' customers written (' + merged + ' duplicate rows merged)';
}

/* ------------------------- CRM ACTION HANDLERS ------------------------- */

/* Quick stock / status update for one SKU */
function updateStock(body){
  var t = readTable('Products', PRODUCT_COLS);
  if (!t || t.col.sku < 0) return json({ ok: false, error: 'Products tab has no SKU column' });
  var col = t.col;
  if (body.stock !== undefined && col.stock < 0) return json({ ok: false, error: 'Products tab has no Stock column' });

  for (var r = 1; r < t.data.length; r++){
    if (String(t.data[r][col.sku]).trim() === String(body.sku).trim()){
      if (body.stock !== undefined)                  t.s.getRange(r + 1, col.stock + 1).setValue(Number(body.stock));
      if (body.status !== undefined && col.status >= 0) t.s.getRange(r + 1, col.status + 1).setValue(body.status);
      return json({ ok: true });
    }
  }
  return json({ ok: false, error: 'sku not found' });
}

/* Save (create or edit) full product details from the CRM.
 *
 * body.original is the product as the CRM last loaded it. Stock and status
 * also change when orders come in, so if the operator didn't touch them in
 * the editor they are left alone — otherwise editing a description would
 * write back a stock count from minutes ago and undo every sale since. */
function saveProduct(body){
  var p = body.product;
  if (!p || !String(p.sku || '').trim()) return json({ ok: false, error: 'missing product data or sku' });
  var sku = String(p.sku).trim();

  var t = readTable('Products', PRODUCT_COLS);
  if (!t || t.col.sku < 0) return json({ ok: false, error: 'Products tab has no SKU column' });

  var targetRow = -1;
  for (var r = 1; r < t.data.length; r++){
    if (String(t.data[r][t.col.sku]).trim() === sku){ targetRow = r + 1; break; }
  }

  var values = {
    sku: sku,
    name: p.name || '',
    nameAr: p.nameAr || '',
    category: p.category || 'Sketchbooks',
    size: p.size || 'A5',
    sheets: Number(p.sheets) || 0,
    gsm: Number(p.gsm) || 0,
    paperType: p.paperType || '',
    price: Number(p.price) || 0,
    compareAt: Number(p.compareAt) || 0,
    stock: Number(p.stock) || 0,
    status: p.status || 'Active',
    image: p.image || '',
    description: p.description || '',
    featured: p.featured ? 'Yes' : 'No'
  };

  if (targetRow < 0) {
    t.s.appendRow(buildRow(t.head, PRODUCT_COLS, values));
    return json({ ok: true, sku: sku, created: true });
  }

  var orig = body.original;
  if (orig) {
    if (Number(orig.stock) === Number(p.stock)) delete values.stock;
    if (String(orig.status || '') === String(p.status || '')) delete values.status;
  }

  for (var k in values){
    var c = t.col[k];
    if (c >= 0 && k !== 'sku') t.s.getRange(targetRow, c + 1).setValue(values[k]);
  }
  return json({ ok: true, sku: sku });
}

/* Delete a product row */
function deleteProduct(body){
  var t = readTable('Products', PRODUCT_COLS);
  if (!t || t.col.sku < 0) return json({ ok: false, error: 'Products tab has no SKU column' });

  for (var r = 1; r < t.data.length; r++){
    if (String(t.data[r][t.col.sku]).trim() === String(body.sku).trim()){
      t.s.deleteRow(r + 1);
      return json({ ok: true });
    }
  }
  return json({ ok: false, error: 'sku not found' });
}

function findOrderRow(t, orderId){
  if (t.col.id < 0) return -1;
  for (var r = 1; r < t.data.length; r++){
    if (String(t.data[r][t.col.id]).trim() === String(orderId).trim()) return r;
  }
  return -1;
}

function orderItems(orderId){
  var t = readTable('Order_Items', ITEM_COLS);
  if (!t || t.col.id < 0 || t.col.sku < 0 || t.col.qty < 0) return [];
  return t.data.slice(1)
    .filter(function(r){ return String(r[t.col.id]).trim() === String(orderId).trim(); })
    .map(function(r){ return { sku: r[t.col.sku], qty: Number(r[t.col.qty]) || 0 }; });
}

/* Update order status; keeps stock and the customer's totals in step. */
function updateOrderStatus(body){
  var next = String(body.status || '').trim();
  if (!next) return json({ ok: false, error: 'missing status' });

  var t = readTable('Orders', ORDER_COLS);
  if (!t || t.col.status < 0) return json({ ok: false, error: 'Orders tab has no Status column' });
  var r = findOrderRow(t, body.orderId);
  if (r < 0) return json({ ok: false, error: 'order not found' });

  var prev = String(t.data[r][t.col.status] || 'Pending').trim();
  if (prev === next) return json({ ok: true });

  t.s.getRange(r + 1, t.col.status + 1).setValue(next);

  if (RESTOCK_ON_CANCEL) {
    if (prev !== 'Cancelled' && next === 'Cancelled') adjustStock(orderItems(body.orderId), +1);
    if (prev === 'Cancelled' && next !== 'Cancelled') adjustStock(orderItems(body.orderId), -1);
  }

  if (t.col.phone >= 0) refreshCustomer(t.data[r][t.col.phone]);
  return json({ ok: true });
}

/* Log WhatsApp outreach status */
function logWhatsApp(body){
  var s = sheet('Orders');
  if (!s) return json({ ok: false, error: 'Orders tab not found' });
  var head = ensureCols(s, { id: ORDER_COLS.id, wa: ORDER_COLS.wa });
  var t = readTable('Orders', ORDER_COLS);
  var r = findOrderRow(t, body.orderId);
  if (r < 0) return json({ ok: false, error: 'order not found' });
  t.s.getRange(r + 1, findCol(head, ORDER_COLS.wa) + 1).setValue(body.sent ? 'Yes' : 'No');
  return json({ ok: true });
}

/* Update a customer's tag and/or notes, matched by phone in any format. */
function updateCustomer(body){
  var s = sheet('Customers');
  if (!s) return json({ ok: false, error: 'Customers tab not found' });
  var head = ensureCols(s, { phone: CUSTOMER_COLS.phone, tag: CUSTOMER_COLS.tag, notes: CUSTOMER_COLS.notes });
  var col = colMap(head, CUSTOMER_COLS);
  var key = canonPhone(body.phone);
  if (!key) return json({ ok: false, error: 'missing phone' });

  var data = s.getDataRange().getValues();
  for (var r = 1; r < data.length; r++){
    if (canonPhone(data[r][col.phone]) === key){
      if (body.tag !== undefined)   s.getRange(r + 1, col.tag + 1).setValue(sheetSafe(body.tag));
      if (body.notes !== undefined) s.getRange(r + 1, col.notes + 1).setValue(sheetSafe(body.notes));
      return json({ ok: true });
    }
  }
  return json({ ok: false, error: 'customer not found' });
}

/* Aggregated business analytics. Same rules as the CRM: cancelled and
 * returned orders are not revenue. */
function calculateAnalytics(){
  var t = readTable('Orders', ORDER_COLS);
  var customers = readSheet('Customers');
  var products = readProducts();

  var totalRevenue = 0, deliveredRevenue = 0, liveOrders = 0;
  var totalOrders = 0, pendingOrders = 0, deliveredOrders = 0, cancelledOrders = 0;
  var govDistribution = {};

  if (t) {
    for (var r = 1; r < t.data.length; r++){
      var row = t.data[r];
      if (String(cellOf(row, t.col.id)).trim() === '') continue;
      totalOrders++;
      var total = Number(cellOf(row, t.col.total)) || 0;
      var status = String(cellOf(row, t.col.status) || 'Pending');
      var isVoid = status === 'Cancelled' || status === 'Returned';
      var gov = String(cellOf(row, t.col.gov) || 'Cairo').split('·')[0].split(',')[0].trim() || 'Cairo';

      if (!isVoid) { totalRevenue += total; liveOrders++; }
      if (status === 'Delivered') { deliveredRevenue += total; deliveredOrders++; }
      else if (status === 'Pending') pendingOrders++;
      else if (isVoid) cancelledOrders++;

      govDistribution[gov] = (govDistribution[gov] || 0) + 1;
    }
  }

  return {
    totalRevenue: totalRevenue,
    deliveredRevenue: deliveredRevenue,
    totalOrders: totalOrders,
    pendingOrders: pendingOrders,
    deliveredOrders: deliveredOrders,
    cancelledOrders: cancelledOrders,
    aov: liveOrders > 0 ? Math.round(totalRevenue / liveOrders) : 0,
    totalCustomers: customers.length,
    totalStockUnits: products.reduce(function(s, p){ return s + Number(p.stock); }, 0),
    lowStockSkus: products.filter(function(p){ return p.stock > 0 && p.stock <= 5; }).length,
    outOfStockSkus: products.filter(function(p){ return p.stock === 0; }).length,
    govDistribution: govDistribution
  };
}

/* ------------------------- ONE-TIME REPAIR ------------------------- */
/* Run from the editor (function dropdown ▸ setupSheet ▸ Run). It:
 *  1. Copies the Orders and Customers tabs to "… backup <date>" tabs.
 *  2. Orders: adds any missing standard column, turns the phone column into
 *     plain text and rewrites every number as 01XXXXXXXXX.
 *  3. Order_Items: adds any missing standard column.
 *  4. Customers: rebuilt from Orders with the headers the CRM expects —
 *     Phone (WhatsApp) | Customer Name | Email | Delivery Address |
 *     First Order Date | Total Orders | Total Spent (EGP) | Customer Tag | Notes
 *     — keeping your tags, notes and any extra columns.
 *  5. Products: reports (does not change) any standard column it can't find.
 * Stock is NOT touched. Delete the backup tabs once you're happy. */
function setupSheet(){
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  var report = [];
  try {
    var book = ss();
    var stamp = Utilities.formatDate(new Date(), 'GMT+2', 'yyyy-MM-dd HHmmss');

    ['Orders', 'Customers'].forEach(function(n){
      var s = sheet(n);
      if (s) { s.copyTo(book).setName(n + ' backup ' + stamp); report.push('Backed up ' + n); }
    });

    var o = sheet('Orders') || book.insertSheet('Orders');
    var oHead = ensureCols(o, ORDER_COLS);
    o.setFrozenRows(1);
    var pc = findCol(oHead, ORDER_COLS.phone) + 1;
    if (o.getMaxRows() > 1) o.getRange(2, pc, o.getMaxRows() - 1, 1).setNumberFormat('@');
    var last = o.getLastRow();
    if (last >= 2){
      var range = o.getRange(2, pc, last - 1, 1);
      var changed = 0;
      var fixed = range.getValues().map(function(v){
        var canon = canonPhone(v[0]) || String(v[0]);
        if (canon !== String(v[0])) changed++;
        return [canon];
      });
      range.setValues(fixed);
      report.push('Orders: ' + changed + ' phone numbers fixed');
    }

    var oi = sheet('Order_Items') || book.insertSheet('Order_Items');
    ensureCols(oi, ITEM_COLS);
    oi.setFrozenRows(1);

    report.push('Customers: ' + rebuildCustomers());

    var p = sheet('Products');
    if (!p) {
      report.push('WARNING: no Products tab found');
    } else {
      var pm = colMap(headerOf(p), PRODUCT_COLS);
      var missing = [];
      for (var k in pm) if (pm[k] < 0) missing.push(PRODUCT_COLS[k][0]);
      report.push(missing.length ? 'Products: columns not found (left as is): ' + missing.join(', ') : 'Products: all columns found');
    }

    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  Logger.log(report.join('\n'));
  return report.join('\n');
}

/* ------------------------- EMAIL TEMPLATES ------------------------- */

function esc(v){
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function money(n){ return Number(n || 0) + ' ' + CURRENCY; }

function itemRowsHtml(items){
  return items.map(function(i){
    var line = Number(i.qty) * Number(i.price);
    return '<tr>'
      + '<td style="padding:8px 0;border-bottom:1px solid #E6D9C7;color:#241C1B;">' + esc(i.name)
        + ' <strong>×' + esc(i.qty) + '</strong></td>'
      + '<td style="padding:8px 0;border-bottom:1px solid #E6D9C7;text-align:right;color:#241C1B;white-space:nowrap;">'
        + esc(money(line)) + '</td>'
      + '</tr>';
  }).join('');
}

function orderTablesHtml(o){
  var addr = esc(o.c.governorate || '') + (o.c.city ? ', ' + esc(o.c.city) : '') + ' — ' + esc(o.c.address || '');
  return ''
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">'
    +   itemRowsHtml(o.items)
    +   '<tr><td style="padding:8px 0;color:#6B5D50;">Delivery (' + esc(o.c.governorate || '') + ')</td>'
    +     '<td style="padding:8px 0;text-align:right;color:#6B5D50;">' + (o.shipping === 0 ? 'FREE' : esc(money(o.shipping))) + '</td></tr>'
    +   '<tr><td style="padding:10px 0 0;font-weight:bold;color:#4C2224;font-size:16px;">Total (Cash on Delivery)</td>'
    +     '<td style="padding:10px 0 0;text-align:right;font-weight:bold;color:#4C2224;font-size:16px;">' + esc(money(o.total)) + '</td></tr>'
    + '</table>'
    + '<div style="margin-top:16px;padding:12px 14px;background:#F4ECE0;border:1px solid #E6D9C7;font-size:13px;color:#241C1B;">'
    +   '<div style="font-weight:bold;">Delivery to</div>'
    +   '<div>' + esc(o.c.name) + ' · ' + esc(o.c.phone) + (o.c.email ? ' · ' + esc(o.c.email) : '') + '</div>'
    +   '<div>' + addr + '</div>'
    +   (o.notes ? '<div style="margin-top:6px;color:#6B5D50;"><em>Notes: ' + esc(o.notes) + '</em></div>' : '')
    + '</div>';
}

/* OWNER_EMAIL plus any valid addresses in the NOTIFY_EMAILS script property. */
function ownerRecipients(){
  var extra = String(PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAILS') || '')
    .split(',')
    .map(function(e){ return e.trim(); })
    .filter(function(e){ return /^[^\s@,]+@[^\s@,]+\.[^\s@,]{2,}$/.test(e) && e.toLowerCase() !== OWNER_EMAIL.toLowerCase(); });
  return [OWNER_EMAIL].concat(extra).join(',');
}

function sendOwnerEmail(o){
  var subject = 'New order ' + o.orderId + ' — ' + o.c.name + ' — ' + money(o.total);
  var html = ''
    + '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#241C1B;">'
    +   '<h2 style="color:#4C2224;margin:0 0 4px;">New order ' + esc(o.orderId) + '</h2>'
    +   '<p style="margin:0 0 16px;color:#6B5D50;font-size:13px;">' + esc(o.now) + ' · ' + esc(o.payment) + '</p>'
    +   orderTablesHtml(o)
    +   '<p style="margin:18px 0 0;font-size:13px;color:#6B5D50;">Confirm with the customer by WhatsApp or Phone within 24h.</p>'
    + '</div>';
  MailApp.sendEmail({
    to: ownerRecipients(),
    replyTo: o.to || REPLY_TO,
    name: STORE_NAME,
    subject: subject,
    htmlBody: html
  });
}

function sendCustomerReceipt(o){
  if (!o.to) return;
  var subject = 'Your Waraqa order ' + o.orderId + ' · إيصال طلبك من ورقة';
  var en = ''
    + '<h2 style="color:#4C2224;margin:0 0 4px;">Thank you for your order!</h2>'
    + '<p style="margin:0 0 4px;color:#241C1B;">Order reference <strong>' + esc(o.orderId) + '</strong></p>'
    + '<p style="margin:0 0 8px;color:#6B5D50;font-size:13px;">This is your receipt. We will confirm your order shortly by <strong>WhatsApp and email</strong> to go over your delivery timing — usually within ' + esc(SLA_HOURS) + ' hours.</p>'
    + '<p style="margin:0 0 16px;color:#6B5D50;font-size:13px;">Delivery takes <strong>' + esc(DELIVERY_DAYS_MIN) + '–' + esc(DELIVERY_DAYS_MAX) + ' business days</strong> once confirmed. You pay the courier in cash on arrival.</p>'
    + orderTablesHtml(o);

  var ar = ''
    + '<div dir="rtl" style="text-align:right;">'
    +   '<h2 style="color:#4C2224;margin:0 0 4px;">شكراً لطلبك من ورقة!</h2>'
    +   '<p style="margin:0 0 4px;color:#241C1B;">رقم الطلب <strong>' + esc(o.orderId) + '</strong></p>'
    +   '<p style="margin:0 0 8px;color:#6B5D50;font-size:13px;">ده إيصال طلبك. هنأكد الطلب معاك على <strong>واتساب والإيميل</strong> عشان نراجع معاك التفاصيل وميعاد التسليم — عادةً خلال ' + esc(SLA_HOURS) + ' ساعة.</p>'
    +   '<p style="margin:0 0 8px;color:#6B5D50;font-size:13px;">التوصيل بياخد <strong>من ' + esc(DELIVERY_DAYS_MIN) + ' لـ ' + esc(DELIVERY_DAYS_MAX) + ' أيام عمل</strong> بعد التأكيد. والدفع كاش للمندوب عند الاستلام.</p>'
    + '</div>';

  var html = ''
    + '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#241C1B;padding:8px;">'
    +   '<div style="text-align:center;padding:8px 0 16px;font-size:22px;font-weight:bold;color:#4C2224;letter-spacing:1px;">Waraqa · ورقة</div>'
    +   en
    +   '<hr style="border:none;border-top:1px solid #E6D9C7;margin:22px 0;" />'
    +   ar
    +   '<p style="margin:22px 0 0;font-size:12px;color:#6B5D50;text-align:center;">'
    +     'Questions? WhatsApp us at +' + esc(SUPPORT_WA) + ' · للاستفسار كلّمنا واتساب على +' + esc(SUPPORT_WA)
    +   '</p>'
    + '</div>';

  MailApp.sendEmail({
    to: o.to,
    replyTo: REPLY_TO,
    name: STORE_NAME,
    subject: subject,
    htmlBody: html
  });
}

/* ------------------------- HELPERS ------------------------- */

/* A tab as an array of { header: value } objects (used by the CRM reads). */
function readSheet(name){
  var s = sheet(name);
  if (!s) return [];
  var data = s.getDataRange().getValues();
  if (data.length < 2) return [];
  var head = data[0];
  return data.slice(1).filter(function(r){ return String(r[0]).trim() !== ''; }).map(function(r){
    var o = {};
    head.forEach(function(h, i){
      o[h] = r[i];
    });
    return o;
  });
}
