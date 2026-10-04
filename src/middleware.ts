import { NextResponse, type NextRequest } from 'next/server';
import { SITE_URL } from '@/lib/seo';

const LOCALES = ['en', 'ar'] as const;
const DEFAULT_LOCALE = 'en';
const COOKIE = 'NEXT_LOCALE';

const CANONICAL = new URL(SITE_URL);

/**
 * Is this request on a host or scheme other than the canonical origin?
 *
 * www.waraqa.art and the waraqastore.vercel.app mirror (Vercel still builds
 * `main`) served full copies of the site, held apart only by a canonical tag;
 * and plain http:// was answered with a 200 rather than sent to https. A 308 to
 * the one origin consolidates links and closes the downgrade.
 *
 * Local hosts (next dev, next start, wrangler preview) are left alone.
 */
function needsCanonicalOrigin(request: NextRequest): boolean {
  const host = (request.headers.get('host') || request.nextUrl.host).toLowerCase();
  const hostname = host.split(':')[0];
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname.endsWith('.localhost')) {
    return false;
  }

  const isWww = hostname === `www.${CANONICAL.hostname}`;
  // Production only: preview deployments live on other *.vercel.app hosts and
  // must stay reachable for review.
  const isVercelMirror = process.env.VERCEL_ENV === 'production' && hostname.endsWith('.vercel.app');
  if (isWww || isVercelMirror) return true;

  return hostname === CANONICAL.hostname && CANONICAL.protocol === 'https:' && visitorUsedHttp(request);
}

/**
 * True only when Cloudflare says the visitor connected over plain http.
 *
 * `CF-Visitor` carries the visitor's own scheme. `X-Forwarded-Proto` is not
 * used: on Cloudflare it describes the hop to an origin, and `next start` fills
 * it from its own socket, so trusting it could 308 an https page to itself
 * forever. No header, or anything unparseable, means no redirect: the worst
 * case is a missed upgrade (HSTS and Cloudflare's "Always Use HTTPS" cover
 * that), never a loop.
 */
function visitorUsedHttp(request: NextRequest): boolean {
  const raw = request.headers.get('cf-visitor');
  if (!raw) return false;
  try {
    return JSON.parse(raw)?.scheme === 'http';
  } catch {
    return false;
  }
}

/**
 * Send every un-prefixed path to a locale-prefixed one.
 *
 * Language used to live in localStorage, which the server cannot read — so every
 * crawler, and every first paint, got English no matter what. A cookie can be read
 * during the request, so the choice now happens before rendering and the served
 * HTML matches the language the visitor actually gets.
 *
 * A redirect (not a rewrite) is deliberate: each language must settle on one
 * canonical URL, or both end up competing for the same one in the index.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  const wrongOrigin = needsCanonicalOrigin(request);
  if (hasLocale && !wrongOrigin) return NextResponse.next();

  let target = pathname;
  if (!hasLocale) {
    const cookie = request.cookies.get(COOKIE)?.value;
    const accept = (request.headers.get('accept-language') || '').toLowerCase();
    const locale = LOCALES.includes(cookie as (typeof LOCALES)[number])
      ? cookie
      : accept.startsWith('ar')
        ? 'ar'
        : DEFAULT_LOCALE;
    target = `/${locale}${pathname === '/' ? '' : pathname}`;
  }

  // Origin and locale are fixed in the same hop, so http://www.waraqa.art/shop
  // reaches https://waraqa.art/en/shop with one redirect, not three.
  if (wrongOrigin) {
    return NextResponse.redirect(new URL(`${target}${search}`, SITE_URL), 308);
  }
  const url = request.nextUrl.clone();
  url.pathname = target;
  return NextResponse.redirect(url, 308);
}

export const config = {
  // Everything except API routes, Next internals, and any path with a file
  // extension — which keeps /sitemap.xml, /robots.txt and /products/*.jpeg
  // reachable without a locale prefix.
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
