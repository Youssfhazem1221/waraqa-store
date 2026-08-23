import type { NextConfig } from 'next';

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
};

export default nextConfig;
