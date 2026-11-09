// The live catalog and shipping zones for the browser, from the data Worker.
import { dataWorker, toApiProduct } from '@/lib/data-worker';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await dataWorker();
  if (!data) return Response.json({ ok: false, error: 'not-configured' }, { status: 503 });
  try {
    const c = await data.catalog();
    return Response.json(
      { ok: true, products: c.products.map(toApiProduct), zones: c.zones, readAt: c.readAt },
      // Short shared cache: many visitors at once cost one read, and a CRM edit
      // still shows within seconds.
      { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=5' } }
    );
  } catch (err) {
    console.error('[api/catalog]', err);
    return Response.json({ ok: false, error: 'unavailable' }, { status: 502 });
  }
}
