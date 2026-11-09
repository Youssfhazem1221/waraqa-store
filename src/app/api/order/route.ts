// Place an order. The data Worker re-prices every line and the shipping from
// the Sheet, checks stock and writes it under its lock; nothing the browser
// sends about prices is trusted.
import { dataWorker, type OrderRequest } from '@/lib/data-worker';

export const dynamic = 'force-dynamic';

const str = (v: unknown, max: number) => String(v ?? '').slice(0, max);

export async function POST(request: Request) {
  const data = await dataWorker();
  if (!data) return Response.json({ ok: false, error: 'Store backend not configured' }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 20_000) return Response.json({ ok: false, error: 'Order too large.' }, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return Response.json({ ok: false, error: 'bad json' }, { status: 400 });
  }

  const c = (body.customer ?? {}) as Record<string, unknown>;
  const items = Array.isArray(body.items) ? body.items : [];
  const req: OrderRequest = {
    customer: {
      name: str(c.name, 200),
      phone: str(c.phone, 40),
      email: str(c.email, 300),
      governorate: str(c.governorate, 100),
      city: str(c.city, 100),
      address: str(c.address, 400),
    },
    items: items.slice(0, 40).map((i: { sku?: unknown; qty?: unknown }) => ({ sku: str(i?.sku, 60), qty: Number(i?.qty) || 0 })),
    notes: str(body.notes, 1200),
    lang: body.lang === 'ar' ? 'ar' : 'en',
  };

  try {
    const res = await data.createOrder(req);
    return Response.json(res, { status: res.ok ? 200 : 422 });
  } catch (err) {
    console.error('[api/order]', err);
    return Response.json(
      { ok: false, error: 'We could not place your order just now. Please try again in a moment.' },
      { status: 502 }
    );
  }
}
