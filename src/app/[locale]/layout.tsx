import type { Metadata } from 'next';
import { Readex_Pro, Reem_Kufi } from 'next/font/google';
import '../globals.css';
import { SITE_URL, LOCALES, isLocale, DEFAULT_LOCALE, seoAlternates, absoluteUrl, ogDefaults } from '@/lib/seo';
import { organizationSchema, webSiteSchema } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import { PostHogProvider } from '@/providers/PostHogProvider';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { Analytics } from '@vercel/analytics/next';

// Brand typography (see BRAND_GUIDELINES.md): Reem Kufi sets Arabic headlines;
// Readex Pro sets everything else — Arabic and English text, English headlines,
// UI and prices. Both are variable fonts, so no weight list is needed.
const readex = Readex_Pro({
  subsets: ['arabic', 'latin'],
  variable: '--font-readex',
  display: 'swap',
});

const reemKufi = Reem_Kufi({
  subsets: ['arabic', 'latin'],
  variable: '--font-reem-kufi',
  display: 'swap',
});

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;

  const isAr = l === 'ar';

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: isAr
        ? 'ورقة | سكتش بوك وورق رسم فاخر'
        : 'Waraqa (ورقة) | Premium Sketchbooks & Paper Goods',
      template: isAr ? '%s · ورقة' : '%s · Waraqa (ورقة)',
    },
    description: isAr
      ? 'سكتشات رسم وورق فاخر مصنوع يدوي في القاهرة. ورق سميك من ١٥٠ لـ ٣٢٠ gsm: مكسد ميديا، كرافت، ورسم. توصيل لكل مصر.'
      : 'An identity for sketchbooks and paper goods. Warm, hand-made, and quietly confident. High-gsm mixed media, kraft, and drawing sketchbooks in Egypt.',
    keywords: isAr
      ? ['سكتش بوك', 'دفتر رسم', 'ورقة', 'سكتش بوك مصر', 'ورق كانسون', 'ورق رسم', 'مكسد ميديا', 'كرافت', 'أدوات رسم مصر', 'Waraqa']
      : ['sketchbook', 'sketchbooks Egypt', 'Waraqa', 'ورقة', 'دفتر رسم', 'سكتش بوك', 'mixed media paper', 'kraft sketchbook', 'art supplies Egypt', 'watercolor paper'],
    authors: [{ name: 'Waraqa' }],
    icons: {
      icon: '/logos/waraqa-1x1-dark-cream.svg',
      apple: '/logos/waraqa-1x1-dark-1024.png',
    },
    alternates: seoAlternates(l, '/'),
    openGraph: {
      title: isAr
        ? 'ورقة | سكتش بوك وورق رسم فاخر'
        : 'Waraqa (ورقة) | Premium Sketchbooks & Paper Goods',
      description: isAr
        ? 'سكتشات رسم وورق فاخر مصنوع يدوي، للفنانين والمبدعين في مصر.'
        : 'Warm, hand-made sketchbooks and paper goods built for artists and thinkers.',
      url: absoluteUrl(l, '/'),
      ...ogDefaults(l),
    },
    // Card type only. A title, description or image here is inherited by every
    // page that does not set its own `twitter` (none do), so every shared link
    // showed the homepage's text; without them, X falls back to each page's og:*.
    twitter: {
      card: 'summary_large_image',
    },
    // Search Console / Bing ownership tokens, if set. DNS verification of the
    // waraqa.art domain property in Cloudflare is preferred and needs neither.
    verification: {
      ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }),
      ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION && { other: { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } }),
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const isRTL = l === 'ar';

  return (
    <html
      lang={l}
      dir={isRTL ? 'rtl' : 'ltr'}
      suppressHydrationWarning
      className={`${readex.variable} ${reemKufi.variable}${isRTL ? ' rtl' : ''}`}
    >
      <body
        suppressHydrationWarning
        className="bg-cream text-char antialiased min-h-screen flex flex-col selection:bg-maroon selection:text-cream font-sans"
      >
        <LanguageProvider locale={l}>
          <PostHogProvider>
            <CartProvider>
              <AnnouncementBar />
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
            </CartProvider>
          </PostHogProvider>
        </LanguageProvider>
        <JsonLd data={[organizationSchema(), webSiteSchema(l)]} />
        {/* Vercel's analytics endpoint only exists on Vercel; on Cloudflare the
            script 404s. PostHog covers analytics everywhere. */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  );
}
