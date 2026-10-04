import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

/**
 * Where the storefront may load from or talk to. Everything is first-party
 * except PostHog (analytics, plus the scripts it lazy-loads from its asset
 * host) and the Apps Script order endpoint, which answers from
 * script.googleusercontent.com after a redirect.
 *
 * Inline scripts stay allowed: Next's App Router bootstraps with inline
 * <script> tags, and nonces would force every page to render per request. The
 * policy still blocks scripts from any other origin, plugins, framing, and
 * <base>/form hijacking. `unsafe-eval` is dev-only (React Refresh needs it).
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''} https://*.posthog.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.posthog.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.posthog.com https://script.google.com https://script.googleusercontent.com",
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig: NextConfig = {
  images: {
    // Optimization was switched off, so every product card downloaded the full
    // source JPEG — 230–700 kB each, ~2.5 MB for one pass of the shop page, to
    // fill boxes a few hundred pixels wide. The photographs are large on
    // purpose (they need to hold up on the product page), so the fix is to let
    // Next resize and re-encode them per breakpoint rather than to shrink the
    // originals.
    //
    // This needs a server runtime. The app already requires one: product pages
    // use ISR (`export const revalidate`), which a purely static export cannot
    // do. If this store ever moves to static-only hosting, set
    // `unoptimized: true` again and pre-size the source images instead.
    formats: ['image/avif', 'image/webp'],
    // Product cards render at roughly 1/4, 1/2 and full container width; these
    // widths line up with the `sizes` attributes used across the components.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [48, 80, 96, 128, 256, 384],
    // Cache a rendered variant for a month — the source files are static
    // assets that only change on deploy.
    minimumCacheTTL: 2678400,
  },

  // Trim the response a little; the platform usually handles compression, but
  // this covers self-hosted runs too.
  compress: true,

  // Do not advertise the framework version to every visitor.
  poweredByHeader: false,

  async redirects() {
    return [
      // WRQ-SQ-250 was listed as a 25×25 "square" book; it is 25×35. Keep the
      // old URL alive for anyone who bookmarked or indexed it.
      {
        source: '/:locale(en|ar)/product/square-sketchbook-25x25-250gsm',
        destination: '/:locale/product/large-mixed-media-sketchbook-25x35-250gsm',
        permanent: true,
      },
      {
        source: '/product/square-sketchbook-25x25-250gsm',
        destination: '/en/product/large-mixed-media-sketchbook-25x35-250gsm',
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Vercel added HSTS at its edge; the move to Cloudflare dropped it.
          // Same value as before, so the preload eligibility carries over.
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
        ],
      },
    ];
  },
};

export default nextConfig;

// Lets `next dev` reach Cloudflare bindings (KV, Images) the same way the
// deployed Worker does. No effect on `next build` or on Vercel.
initOpenNextCloudflareForDev();
