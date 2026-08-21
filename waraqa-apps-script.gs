/**
 * Waraqa (ورقة) — Unified Backend & CRM Engine on Google Sheets + Apps Script.
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open your Google Sheet (Extensions ▸ Apps Script).
 * 2. Replace all code in the editor with this script.
 * 3. Set your private ADMIN_TOKEN on line 20 (must match your CRM / Admin login).
 * 4. Click Deploy ▸ New deployment ▸ Type: Web app ▸ Execute as: Me ▸ Who has access: Anyone.
 * 5. Copy the /exec URL into your Next.js environment variable: NEXT_PUBLIC_WEB_APP_URL.
 */

const SHEET_ID    = '1eeCP8SSIWg2V-gjzCjPpQOiPQelYnIXXOvNcjZPfSP0';   // from the sheet URL
const ADMIN_TOKEN = 'CHANGE_ME_to_a_long_random_secret';             // must match the CRM / Admin password

/* ------------------------- STORE & NOTIFICATION CONFIG ------------------------- */
const OWNER_EMAIL = 'youssf.hazem1221@gmail.com'; // where new order alerts are sent
const STORE_NAME  = 'Waraqa';                     // email sender name
const REPLY_TO    = 'youssf.hazem1221@gmail.com'; // customer replies land here
const CURRENCY    = 'EGP';
const SUPPORT_WA  = '201069237525';               // support WhatsApp in international format
const SLA_HOURS   = 24;                            // commitment window to confirm orders

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

/* ------------------------- READ ENDPOINTS (Storefront & CRM) ------------------------- */
function doGet(e){
  var what = (e.parameter.what || 'products');

  // Public catalog endpoint (Storefront)
  if (what === 'products') {
    return json({ ok: true, products: readProducts() });
  }

  // Admin-authenticated CRM endpoints
  if (e.parameter.token !== ADMIN_TOKEN) {
    return json({ ok: false, error: 'unauthorized' });
  }

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
}

/* Expose products cleanly for both storefront and CRM */
function readProducts(){
  var rows = readSheet('Products');
  return rows.map(function(r){
    return {
      sku: r['SKU'] || '',
      name: r['Name (EN)'] || r['Name'] || '',
      nameAr: r['Name (AR)'] || '',
      category: r['Category'] || 'Sketchbooks',
      size: r['Size'] || 'A5',
      sheets: Number(r['Sheets']) || 0,
      gsm: Number(r['GSM']) || 0,
      paperType: r['Paper Type'] || r['Paper feel'] || '',
      price: Number(r['Price (EGP)']) || Number(r['Price']) || 0,
      compareAt: Number(r['Compare-at (EGP)']) || Number(r['Compare-at']) || 0,
      stock: Number(r['Stock']) || 0,
      status: r['Status'] || 'Active',
      image: r['Image filename'] || r['Image'] || '',
      description: r['Short description'] || r['Description'] || '',
      featured: (String(r['Featured?']).toLowerCase() === 'yes' || String(r['Featured']).toLowerCase() === 'true')
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

  // Storefront Public Order Creation
  if (action === 'createOrder') {
    return createOrder(body);
  }

  // Admin-authenticated CRM Actions
  if (body.token !== ADMIN_TOKEN) {
    return json({ ok: false, error: 'unauthorized' });
  }

  if (action === 'updateStock')       return updateStock(body);
  if (action === 'saveProduct')       return saveProduct(body);
  if (action === 'deleteProduct')     return deleteProduct(body);
  if (action === 'updateOrderStatus') return updateOrderStatus(body);
  if (action === 'updateCustomer')    return updateCustomer(body);
  if (action === 'logWhatsApp')       return logWhatsApp(body);

  return json({ ok: false, error: 'unknown action' });
}

/* Create a new customer order from storefront */
function createOrder(body){
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var c = body.customer || {};
    var items = body.items || [];
    var orderId = nextOrderId();
    var now = Utilities.formatDate(new Date(), 'GMT+2', 'yyyy-MM-dd HH:mm');
    var totalQty = items.reduce(function(s, i){ return s + Number(i.qty); }, 0);
    var subtotal = items.reduce(function(s, i){ return s + (Number(i.qty) * Number(i.price)); }, 0);
    var shipping = Number(body.shipping) || 0;
    var total = subtotal + shipping;
    var summary = items.map(function(i){ return i.name + ' ×' + i.qty; }).join(', ');
    var govCity = (c.governorate || '') + (c.city ? ' · ' + c.city : '');

    sheet('Orders').appendRow([
      orderId,
      now,
      c.name,
      c.phone,
      c.email || '',
      govCity,
      c.address || '',
      summary,
      totalQty,
      subtotal,
      shipping,
      total,
      body.payment || 'Cash on delivery',
      'Pending',
      'No',
      body.notes || ''
    ]);

    var oi = sheet('Order_Items');
    items.forEach(function(i){
      oi.appendRow([orderId, i.sku, i.name, i.qty, i.price, (Number(i.qty) * Number(i.price))]);
    });

    decrementStock(items);
    upsertCustomer(c, now, total);

    // Emails sent asynchronously/safely without blocking order confirmation
    var order = { orderId: orderId, now: now, c: c, items: items, subtotal: subtotal, shipping: shipping, total: total, payment: body.payment || 'Cash on delivery', notes: body.notes || '' };
    try { sendOwnerEmail(order); }      catch(err){ Logger.log('Owner email error: ' + err); }
    try { sendCustomerReceipt(order); }  catch(err){ Logger.log('Customer receipt error: ' + err); }

    return json({ ok: true, orderId: orderId, total: total, subtotal: subtotal, shipping: shipping });
  } finally {
    lock.releaseLock();
  }
}

function nextOrderId(){
  var s = sheet('Orders');
  var last = s.getLastRow();
  if (last < 2) return 'WRQ-1001';
  var prev = String(s.getRange(last, 1).getValue()).replace('WRQ-', '');
  var num = parseInt(prev, 10);
  if (isNaN(num)) num = 1000 + last;
  return 'WRQ-' + (num + 1);
}

function decrementStock(items){
  var s = sheet('Products');
  var data = s.getDataRange().getValues();
  var head = data[0];
  var skuC = findCol(head, ['SKU']);
  var stkC = findCol(head, ['Stock', 'Quantity']);
  var stC = findCol(head, ['Status']);

  items.forEach(function(it){
    for (var r = 1; r < data.length; r++){
      if (String(data[r][skuC]) === String(it.sku)){
        var current = Number(data[r][stkC]) || 0;
        var left = Math.max(0, current - Number(it.qty));
        s.getRange(r + 1, stkC + 1).setValue(left);
        if (left === 0 && stC >= 0) {
          s.getRange(r + 1, stC + 1).setValue('Out of stock');
        }
      }
    }
  });
}

function upsertCustomer(c, now, total){
  if (!c.phone) return;
  var s = sheet('Customers');
  var data = s.getDataRange().getValues();
  var phoneStr = String(c.phone).trim();

  for (var r = 1; r < data.length; r++){
    if (String(data[r][0]).trim() === phoneStr){
      var count = (Number(data[r][5]) || 0) + 1;
      var spent = (Number(data[r][6]) || 0) + Number(total);
      s.getRange(r + 1, 6).setValue(count);
      s.getRange(r + 1, 7).setValue(spent);
      s.getRange(r + 1, 8).setValue(count >= 3 ? 'VIP' : count >= 2 ? 'Repeat' : 'Active');
      return;
    }
  }
  s.appendRow([phoneStr, c.name, c.email || '', (c.governorate || '') + ' ' + (c.address || ''), now.split(' ')[0], 1, total, 'New']);
}

/* ------------------------- CRM ACTION HANDLERS ------------------------- */

/* Quick stock / status update for one SKU */
function updateStock(body){
  var s = sheet('Products');
  var data = s.getDataRange().getValues();
  var head = data[0];
  var skuC = findCol(head, ['SKU']);
  var stkC = findCol(head, ['Stock', 'Quantity']);
  var stC = findCol(head, ['Status']);

  for (var r = 1; r < data.length; r++){
    if (String(data[r][skuC]) === String(body.sku)){
      if (body.stock !== undefined && stkC >= 0)  s.getRange(r + 1, stkC + 1).setValue(Number(body.stock));
      if (body.status !== undefined && stC >= 0) s.getRange(r + 1, stC + 1).setValue(body.status);
      return json({ ok: true });
    }
  }
  return json({ ok: false, error: 'sku not found' });
}

/* Save (Create or Edit) full product details from CRM */
function saveProduct(body){
  var p = body.product;
  if (!p || !p.sku) return json({ ok: false, error: 'missing product data or sku' });

  var s = sheet('Products');
  var data = s.getDataRange().getValues();
  var head = data[0];
  var skuC = findCol(head, ['SKU']);

  var targetRow = -1;
  for (var r = 1; r < data.length; r++){
    if (String(data[r][skuC]) === String(p.sku)){
      targetRow = r + 1;
      break;
    }
  }

  // Row values mapped to standard columns
  var rowValues = [
    p.sku,
    p.name || '',
    p.nameAr || '',
    p.category || 'Sketchbooks',
    p.size || 'A5',
    Number(p.sheets) || 0,
    Number(p.gsm) || 0,
    p.paperType || '',
    Number(p.price) || 0,
    Number(p.compareAt) || 0,
    Number(p.stock) || 0,
    p.status || 'Active',
    p.image || '',
    p.description || '',
    p.featured ? 'Yes' : 'No'
  ];

  if (targetRow > 0) {
    // Update existing row
    s.getRange(targetRow, 1, 1, Math.min(rowValues.length, head.length)).setValues([rowValues.slice(0, head.length)]);
  } else {
    // Append new product
    s.appendRow(rowValues);
  }

  return json({ ok: true, sku: p.sku });
}

/* Delete / Hide a product */
function deleteProduct(body){
  var s = sheet('Products');
  var data = s.getDataRange().getValues();
  var head = data[0];
  var skuC = findCol(head, ['SKU']);

  for (var r = 1; r < data.length; r++){
    if (String(data[r][skuC]) === String(body.sku)){
      s.deleteRow(r + 1);
      return json({ ok: true });
    }
  }
  return json({ ok: false, error: 'sku not found' });
}

/* Update Order Status & Fulfillment details */
function updateOrderStatus(body){
  var s = sheet('Orders');
  var data = s.getDataRange().getValues();
  var head = data[0];
  var idC = findCol(head, ['Order ID', 'Order #']);
  var stC = findCol(head, ['Status']);

  for (var r = 1; r < data.length; r++){
    if (String(data[r][idC]) === String(body.orderId)){
      if (stC >= 0) s.getRange(r + 1, stC + 1).setValue(body.status);
      return json({ ok: true });
    }
  }
  return json({ ok: false, error: 'order not found' });
}

/* Log WhatsApp outreach status */
function logWhatsApp(body){
  var s = sheet('Orders');
  var data = s.getDataRange().getValues();
  var head = data[0];
  var idC = findCol(head, ['Order ID', 'Order #']);
  var waC = findCol(head, ['WhatsApp sent?', 'WhatsApp', 'WA Sent']);

  for (var r = 1; r < data.length; r++){
    if (String(data[r][idC]) === String(body.orderId)){
      if (waC >= 0) s.getRange(r + 1, waC + 1).setValue(body.sent ? 'Yes' : 'No');
      return json({ ok: true });
    }
  }
  return json({ ok: false, error: 'order not found' });
}

/* Update Customer profile notes & tags */
function updateCustomer(body){
  var s = sheet('Customers');
  var data = s.getDataRange().getValues();
  var phoneStr = String(body.phone).trim();

  for (var r = 1; r < data.length; r++){
    if (String(data[r][0]).trim() === phoneStr){
      if (body.tag) s.getRange(r + 1, 8).setValue(body.tag);
      return json({ ok: true });
    }
  }
  return json({ ok: false, error: 'customer not found' });
}

/* Calculate aggregated business analytics */
function calculateAnalytics(){
  var orders = readSheet('Orders');
  var customers = readSheet('Customers');
  var products = readProducts();

  var totalRevenue = 0;
  var deliveredRevenue = 0;
  var totalOrders = orders.length;
  var pendingOrders = 0;
  var deliveredOrders = 0;
  var cancelledOrders = 0;
  var govDistribution = {};

  orders.forEach(function(o){
    var total = Number(o['Total (EGP)']) || Number(o['Total']) || 0;
    var status = o['Status'] || 'Pending';
    var gov = o['Governorate/City'] || 'Cairo';
    var govClean = gov.split('·')[0].split(',')[0].trim();

    totalRevenue += total;
    if (status === 'Delivered') {
      deliveredRevenue += total;
      deliveredOrders++;
    } else if (status === 'Pending') {
      pendingOrders++;
    } else if (status === 'Cancelled' || status === 'Returned') {
      cancelledOrders++;
    }

    govDistribution[govClean] = (govDistribution[govClean] || 0) + 1;
  });

  var aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  var totalStockUnits = products.reduce(function(s, p){ return s + Number(p.stock); }, 0);
  var lowStockSkus = products.filter(function(p){ return p.stock > 0 && p.stock <= 5; }).length;
  var outOfStockSkus = products.filter(function(p){ return p.stock === 0; }).length;

  return {
    totalRevenue: totalRevenue,
    deliveredRevenue: deliveredRevenue,
    totalOrders: totalOrders,
    pendingOrders: pendingOrders,
    deliveredOrders: deliveredOrders,
    cancelledOrders: cancelledOrders,
    aov: aov,
    totalCustomers: customers.length,
    totalStockUnits: totalStockUnits,
    lowStockSkus: lowStockSkus,
    outOfStockSkus: outOfStockSkus,
    govDistribution: govDistribution
  };
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
    to: OWNER_EMAIL,
    replyTo: o.c.email || REPLY_TO,
    name: STORE_NAME,
    subject: subject,
    htmlBody: html
  });
}

function sendCustomerReceipt(o){
  if (!o.c.email) return;
  var subject = 'Your Waraqa order ' + o.orderId + ' · إيصال طلبك من ورقة';
  var en = ''
    + '<h2 style="color:#4C2224;margin:0 0 4px;">Thank you for your order!</h2>'
    + '<p style="margin:0 0 4px;color:#241C1B;">Order reference <strong>' + esc(o.orderId) + '</strong></p>'
    + '<p style="margin:0 0 16px;color:#6B5D50;font-size:13px;">This is your receipt. We will confirm your order shortly by <strong>WhatsApp and email</strong> to go over your delivery timing — usually within ' + esc(SLA_HOURS) + ' hours.</p>'
    + orderTablesHtml(o);

  var ar = ''
    + '<div dir="rtl" style="text-align:right;">'
    +   '<h2 style="color:#4C2224;margin:0 0 4px;">شكراً لطلبك من ورقة!</h2>'
    +   '<p style="margin:0 0 4px;color:#241C1B;">رقم الطلب <strong>' + esc(o.orderId) + '</strong></p>'
    +   '<p style="margin:0 0 8px;color:#6B5D50;font-size:13px;">ده إيصال طلبك. هنأكد الطلب معاك على <strong>واتساب والإيميل</strong> عشان نراجع معاك التفاصيل وميعاد التسليم — عادةً خلال ' + esc(SLA_HOURS) + ' ساعة.</p>'
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
    to: o.c.email,
    replyTo: REPLY_TO,
    name: STORE_NAME,
    subject: subject,
    htmlBody: html
  });
}

/* ------------------------- HELPERS ------------------------- */

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

function findCol(head, aliases){
  for (var i = 0; i < head.length; i++){
    var h = String(head[i]).toLowerCase().trim();
    for (var j = 0; j < aliases.length; j++){
      if (h === aliases[j].toLowerCase().trim()) return i;
    }
  }
  return -1;
}
