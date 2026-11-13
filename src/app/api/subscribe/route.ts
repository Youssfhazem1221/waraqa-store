// Newsletter sign-up, stored in the Sheet's Newsletter tab by the data Worker.
import { dataWorker } from '@/lib/data-worker';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const data = await dataWorker();
  if (!data) return Response.json({ ok: false, error: 'not-configured' }, { status: 503 });
  let body: { email?: unknown; locale?: unknown; source?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'bad json' }, { status: 400 });
  }
  try {
    const res = await data.subscribe(String(body.email ?? '').slice(0, 300), body.locale === 'ar' ? 'ar' : 'en', String(body.source ?? 'storefront').slice(0, 40));
    return Response.json(res, { status: res.ok ? 200 : 422 });
  } catch (err) {
    console.error('[api/subscribe]', err);
    return Response.json({ ok: false, error: 'unavailable' }, { status: 502 });
  }
}
