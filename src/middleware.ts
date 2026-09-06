import { NextResponse, type NextRequest } from 'next/server';

const LOCALES = ['en', 'ar'] as const;
const DEFAULT_LOCALE = 'en';
const COOKIE = 'NEXT_LOCALE';

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
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocale) return NextResponse.next();

  const cookie = request.cookies.get(COOKIE)?.value;
  const accept = (request.headers.get('accept-language') || '').toLowerCase();
  const locale = LOCALES.includes(cookie as (typeof LOCALES)[number])
    ? cookie
    : accept.startsWith('ar')
      ? 'ar'
      : DEFAULT_LOCALE;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  // Everything except API routes, Next internals, and any path with a file
  // extension — which keeps /sitemap.xml, /robots.txt and /products/*.jpeg
  // reachable without a locale prefix.
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
