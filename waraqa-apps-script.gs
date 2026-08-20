/**
 * Waraqa — free "backend" on Google Sheets + Gmail.
 * Deploy: Extensions ▸ Apps Script ▸ paste this ▸ Deploy ▸ New deployment ▸
 *   Type: Web app ▸ Execute as: Me ▸ Who has access: Anyone ▸ copy the /exec URL.
 * Put that URL in the website's env var  NEXT_PUBLIC_WEB_APP_URL.
 *
 * Emails are sent with MailApp (free, uses the Gmail quota of the account that
 * owns this script — ~100 recipients/day on consumer Gmail). No WhatsApp API,
 * no paid AppSheet automation required. AppSheet can sit on top of the same
 * sheet purely as your order-management dashboard.
 *
 * Tabs expected (rename the emoji-prefixed tabs to these plain names, OR edit below):
 *   Products, Orders, Order_Items, Customers
 */

const SHEET_ID    = '1eeCP8SSIWg2V-gjzCjPpQOiPQelYnIXXOvNcjZPfSP0';   // from the sheet URL
const ADMIN_TOKEN = 'CHANGE_ME_to_a_long_random_secret';             // must match the site's ADMIN_TOKEN

/* ------------------------- EMAIL / STORE CONFIG (edit these) ------------------------- */
const OWNER_EMAIL = 'youssf.hazem1221@gmail.com'; // where the "new order" alert is sent
const STORE_NAME  = 'Waraqa';                     // shown as the email sender name
const REPLY_TO    = 'youssf.hazem1221@gmail.com'; // customer replies land here
const CURRENCY    = 'EGP';
const SUPPORT_WA  = '201069237525';               // support WhatsApp, international format, shown in emails
const SLA_HOURS   = 24;                            // we promise to confirm within this many hours

function ss(){ return SpreadsheetApp.openById(SHEET_ID); }
function sheet(name){ return ss().getSheetByName(name); }
function json(obj){ return ContentService.createTextOutput(JSON.stringify(obj))
                      .setMimeType(ContentService.MimeType.JSON); }

/* ------------------------- READ (storefront + admin) ------------------------- */
function doGet(e){
  const what = (e.parameter.what || 'products');
  if (what === 'products') return json({ ok:true, products: readProducts() });
  if (what === 'orders'){
    if (e.parameter.token !== ADMIN_TOKEN) return json({ ok:false, error:'unauthorized' });
    return json({ ok:true, orders: readSheet('Orders') });
  }
  return json({ ok:false, error:'unknown "what"' });
}

function readProducts(){
  const rows = readSheet('Products');
  // expose only what the store needs
  return rows.map(r => ({
    sku:r['SKU'], name:r['Name (EN)'], nameAr:r['Name (AR)'], category:r['Category'],
    price:Number(r['Price (EGP)'])||0, compareAt:Number(r['Compare-at (EGP)'])||0,
    stock:Number(r['Stock'])||0, status:r['Status'],
    image:r['Image filename'], description:r['Short description'],
    featured:(r['Featured?']==='Yes')
  }));
}

/* ------------------------- WRITE ------------------------- */
function doPost(e){
  let body={};
  try { body = JSON.parse(e.postData.contents); } catch(err){ return json({ok:false,error:'bad json'}); }
  const action = body.action;

  if (action === 'createOrder')       return createOrder(body);
  if (action === 'updateStock')       return guarded(body, ()=>updateStock(body));
  if (action === 'updateOrderStatus') return guarded(body, ()=>updateOrderStatus(body));
  return json({ ok:false, error:'unknown action' });
}

function guarded(body, fn){
  if (body.token !== ADMIN_TOKEN) return json({ ok:false, error:'unauthorized' });
  return fn();
}

/* Create an order: writes Orders + Order_Items, upserts Customer, decrements stock,
   emails the owner + emails the customer a receipt. */
function createOrder(body){
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const c = body.customer || {};
    const items = body.items || [];               // [{sku,name,qty,price}]
    const orderId = nextOrderId();
    const now = Utilities.formatDate(new Date(), 'GMT+2', 'yyyy-MM-dd HH:mm');
    const totalQty = items.reduce((s,i)=>s+Number(i.qty),0);
    const subtotal = items.reduce((s,i)=>s+Number(i.qty)*Number(i.price),0);
    const shipping = Number(body.shipping)||0;
    const total = subtotal + shipping;
    const summary = items.map(i=>`${i.name} ×${i.qty}`).join(', ');

    sheet('Orders').appendRow([orderId, now, c.name, c.phone, c.email||'',
      c.city||'', c.address||'', summary, totalQty, subtotal, shipping, total,
      body.payment||'Cash on delivery', 'Pending', 'Web', body.notes||'']);

    const oi = sheet('Order_Items');
    items.forEach(i => oi.appendRow([orderId, i.sku, i.name, i.qty, i.price, Number(i.qty)*Number(i.price)]));

    decrementStock(items);
    upsertCustomer(c, now, total);

    // Emails must never block/kill the order — swallow any failure.
    const order = { orderId, now, c, items, subtotal, shipping, total, payment: body.payment||'Cash on delivery', notes: body.notes||'' };
    try { sendOwnerEmail(order); }     catch(err){ Logger.log('owner email failed: ' + err); }
    try { sendCustomerReceipt(order); } catch(err){ Logger.log('customer email failed: ' + err); }

    return json({ ok:true, orderId, total, subtotal, shipping });
  } finally { lock.releaseLock(); }
}

function nextOrderId(){
  const s = sheet('Orders'); const last = s.getLastRow();
  if (last < 2) return 'WRQ-1001';
  const prev = String(s.getRange(last,1).getValue()).replace('WRQ-','');
  return 'WRQ-' + (parseInt(prev,10)+1);
}

function decrementStock(items){
  const s = sheet('Products'); const data = s.getDataRange().getValues();
  const head = data[0]; const skuC = head.indexOf('SKU'); const stkC = head.indexOf('Stock'); const stC = head.indexOf('Status');
  items.forEach(it=>{
    for (let r=1;r<data.length;r++){
      if (data[r][skuC] === it.sku){
        const left = Math.max(0, Number(data[r][stkC]) - Number(it.qty));
        s.getRange(r+1, stkC+1).setValue(left);
        if (left===0) s.getRange(r+1, stC+1).setValue('Out of stock');
      }
    }
  });
}

function upsertCustomer(c, now, total){
  if(!c.phone) return;
  const s = sheet('Customers'); const data = s.getDataRange().getValues();
  for (let r=1;r<data.length;r++){
    if (String(data[r][0]) === String(c.phone)){
      s.getRange(r+1,6).setValue(Number(data[r][5]||0)+1);          // orders count
      s.getRange(r+1,7).setValue(Number(data[r][6]||0)+Number(total)); // total spent
      return;
    }
  }
  s.appendRow([c.phone, c.name, c.email||'', c.address||'', now.split(' ')[0], 1, total, 'new']);
}

/* Admin: set stock / status for one SKU */
function updateStock(body){
  const s = sheet('Products'); const data = s.getDataRange().getValues(); const head=data[0];
  const skuC=head.indexOf('SKU'), stkC=head.indexOf('Stock'), stC=head.indexOf('Status');
  for (let r=1;r<data.length;r++){
    if (data[r][skuC]===body.sku){
      if (body.stock!==undefined)  s.getRange(r+1,stkC+1).setValue(Number(body.stock));
      if (body.status!==undefined) s.getRange(r+1,stC+1).setValue(body.status);
      return json({ ok:true });
    }
  }
  return json({ ok:false, error:'sku not found' });
}

/* Admin: advance an order's status */
function updateOrderStatus(body){
  const s = sheet('Orders'); const data=s.getDataRange().getValues();
  for (let r=1;r<data.length;r++){
    if (data[r][0]===body.orderId){ s.getRange(r+1,14).setValue(body.status); return json({ok:true}); }
  }
  return json({ ok:false, error:'order not found' });
}

/* ------------------------- EMAILS ------------------------- */

function esc(v){
  return String(v==null?'':v)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function money(n){ return Number(n||0) + ' ' + CURRENCY; }

/** Rows of items as an HTML table body (name ×qty ... line total). */
function itemRowsHtml(items){
  return items.map(function(i){
    var line = Number(i.qty)*Number(i.price);
    return '<tr>'
      + '<td style="padding:8px 0;border-bottom:1px solid #E6D9C7;color:#241C1B;">' + esc(i.name)
        + ' <strong>×' + esc(i.qty) + '</strong></td>'
      + '<td style="padding:8px 0;border-bottom:1px solid #E6D9C7;text-align:right;color:#241C1B;white-space:nowrap;">'
        + esc(money(line)) + '</td>'
      + '</tr>';
  }).join('');
}

/** Shared totals + address block used in both emails. */
function orderTablesHtml(o){
  var addr = esc(o.c.governorate || '') + (o.c.city ? ', ' + esc(o.c.city) : '') + ' — ' + esc(o.c.address || '');
  return ''
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">'
    +   itemRowsHtml(o.items)
    +   '<tr><td style="padding:8px 0;color:#6B5D50;">Delivery (' + esc(o.c.governorate||'') + ')</td>'
    +     '<td style="padding:8px 0;text-align:right;color:#6B5D50;">' + (o.shipping===0 ? 'FREE' : esc(money(o.shipping))) + '</td></tr>'
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

/** Owner alert: a new order just came in. */
function sendOwnerEmail(o){
  var subject = 'New order ' + o.orderId + ' — ' + o.c.name + ' — ' + money(o.total);
  var html = ''
    + '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#241C1B;">'
    +   '<h2 style="color:#4C2224;margin:0 0 4px;">New order ' + esc(o.orderId) + '</h2>'
    +   '<p style="margin:0 0 16px;color:#6B5D50;font-size:13px;">' + esc(o.now) + ' · ' + esc(o.payment) + '</p>'
    +   orderTablesHtml(o)
    +   '<p style="margin:18px 0 0;font-size:13px;color:#6B5D50;">Reply to the customer by email or WhatsApp to confirm details, delivery and timing.</p>'
    + '</div>';
  MailApp.sendEmail({
    to: OWNER_EMAIL,
    replyTo: o.c.email || REPLY_TO,
    name: STORE_NAME,
    subject: subject,
    htmlBody: html
  });
}

/** Customer receipt: bilingual (English + Arabic). */
function sendCustomerReceipt(o){
  if (!o.c.email) return;
  var subject = 'Your Waraqa order ' + o.orderId + ' · إيصال طلبك من ورقة';

  var en = ''
    + '<h2 style="color:#4C2224;margin:0 0 4px;">Thank you for your order!</h2>'
    + '<p style="margin:0 0 4px;color:#241C1B;">Order reference <strong>' + esc(o.orderId) + '</strong></p>'
    + '<p style="margin:0 0 16px;color:#6B5D50;font-size:13px;">This is your receipt. We\'ll confirm your order shortly by <strong>email and WhatsApp</strong> to go over your details, delivery, and timing — usually within ' + esc(SLA_HOURS) + ' hours.</p>'
    + orderTablesHtml(o);

  var ar = ''
    + '<div dir="rtl" style="text-align:right;">'
    +   '<h2 style="color:#4C2224;margin:0 0 4px;">شكراً لطلبك من ورقة!</h2>'
    +   '<p style="margin:0 0 4px;color:#241C1B;">رقم الطلب <strong>' + esc(o.orderId) + '</strong></p>'
    +   '<p style="margin:0 0 8px;color:#6B5D50;font-size:13px;">ده إيصال طلبك. هنأكد الطلب قريب على <strong>الإيميل وعلى واتساب</strong> عشان نراجع معاك التفاصيل والتوصيل وميعاد التسليم — عادةً خلال ' + esc(SLA_HOURS) + ' ساعة.</p>'
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

/* Helper: read a tab as array of {header:value} */
function readSheet(name){
  const s = sheet(name); const data = s.getDataRange().getValues(); const head=data[0];
  return data.slice(1).filter(r=>r[0]!=='').map(r=>{
    const o={}; head.forEach((h,i)=>o[h]=r[i]); return o;
  });
}
