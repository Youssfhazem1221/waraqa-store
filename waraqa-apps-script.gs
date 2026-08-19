/**
 * Waraqa — free "backend" on Google Sheets.
 * Deploy: Extensions ▸ Apps Script ▸ paste this ▸ Deploy ▸ New deployment ▸
 *   Type: Web app ▸ Execute as: Me ▸ Who has access: Anyone ▸ copy the /exec URL.
 * Put that URL in the website's env var  WEB_APP_URL.
 *
 * Tabs expected (rename the emoji-prefixed tabs to these plain names, OR edit below):
 *   Products, Orders, Order_Items, Customers
 */

const SHEET_ID   = '1eeCP8SSIWg2V-gjzCjPpQOiPQelYnIXXOvNcjZPfSP0';      // from the sheet URL
const ADMIN_TOKEN = 'CHANGE_ME_to_a_long_random_secret';   // must match the site's ADMIN_TOKEN

// ---- WhatsApp Cloud API (OPTIONAL — leave blank to skip auto-send) ----
const WA_TOKEN    = '';           // Meta WhatsApp Cloud API permanent token
const WA_PHONE_ID = '';           // Cloud API phone-number ID
const OWNER_WA    = '201069237525'; // your number, international format (Egypt +20, no leading 0)

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

/* Create an order: writes Orders + Order_Items, upserts Customer, decrements stock. */
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
      body.payment||'Cash on delivery', 'Pending', WA_TOKEN?'Auto':'Link', body.notes||'']);

    const oi = sheet('Order_Items');
    items.forEach(i => oi.appendRow([orderId, i.sku, i.name, i.qty, i.price, Number(i.qty)*Number(i.price)]));

    decrementStock(items);
    upsertCustomer(c, now, total);
    if (WA_TOKEN && WA_PHONE_ID) sendWhatsApp(orderId, c, summary, total, shipping);

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

/* Optional: auto-DM the owner via WhatsApp Cloud API */
function sendWhatsApp(orderId, c, summary, total, shipping){
  const url = `https://graph.facebook.com/v20.0/${WA_PHONE_ID}/messages`;
  const text = `🟤 New Waraqa order ${orderId}\n${c.name} — ${c.phone}\n${c.city||''} ${c.address||''}\n${summary}\nShipping ${shipping} · TOTAL ${total} EGP\nReply to confirm.`;
  UrlFetchApp.fetch(url, { method:'post', muteHttpExceptions:true,
    headers:{ Authorization:'Bearer '+WA_TOKEN },
    contentType:'application/json',
    payload: JSON.stringify({ messaging_product:'whatsapp', to:OWNER_WA,
      type:'text', text:{ body:text } }) });
}

/* Helper: read a tab as array of {header:value} */
function readSheet(name){
  const s = sheet(name); const data = s.getDataRange().getValues(); const head=data[0];
  return data.slice(1).filter(r=>r[0]!=='').map(r=>{
    const o={}; head.forEach((h,i)=>o[h]=r[i]); return o;
  });
}
