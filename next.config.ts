import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Static export — produces a pure static `out/` folder
  // deployable to Vercel, Netlify, Cloudflare Pages, etc.
  output: 'export',

  // Required for static export — we handle image optimization via CSS
  images: {
    unoptimized: true,
  },

  // Trailing slash for cleaner static hosting URLs
  trailingSlash: true,
};

export default nextConfig;
