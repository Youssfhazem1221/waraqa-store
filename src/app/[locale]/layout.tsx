import type { Metadata } from 'next';
import { Fraunces, Inter, Tajawal } from 'next/font/google';
import '../globals.css';
import { SITE_URL, LOCALES, isLocale, DEFAULT_LOCALE, seoAlternates, absoluteUrl, ogLocale } from '@/lib/seo';
import { organizationSchema, webSiteSchema } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import { PostHogProvider } from '@/providers/PostHogProvider';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Analytics } from '@vercel/analytics/next';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  variable: '--font-tajawal',
  display: 'swap',
  weight: ['400', '500', '700'],
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
        ? 'ورقة — سكتش بوك وورق رسم فاخر'
        : 'Waraqa (ورقة) — Premium Sketchbooks & Paper Goods',
      template: isAr ? '%s · ورقة' : '%s · Waraqa (ورقة)',
    },
    description: isAr
      ? 'سكتشات رسم وورق فاخر مصنوع يدوي في القاهرة. ورق سميك من ١٥٠ لـ ٣٢٠ gsm — مكسد ميديا، كرافت، ورسم. توصيل لكل مصر.'
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
        ? 'ورقة — سكتش بوك وورق رسم فاخر'
        : 'Waraqa (ورقة) — Premium Sketchbooks & Paper Goods',
      description: isAr
        ? 'سكتشات رسم وورق فاخر مصنوع يدوي — للفنانين والمبدعين في مصر.'
        : 'Warm, hand-made sketchbooks and paper goods built for artists and thinkers.',
      url: absoluteUrl(l, '/'),
      siteName: 'Waraqa',
      ...ogLocale(l),
      type: 'website',
      images: [{ url: `${SITE_URL}/lifestyle/hero-fullbleed.jpg`, width: 1200, height: 630, alt: 'Waraqa — Handmade sketchbooks' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isAr ? 'ورقة — سكتش بوك وورق رسم فاخر' : 'Waraqa (ورقة) — Premium Sketchbooks & Paper Goods',
      description: isAr
        ? 'سكتشات رسم وورق فاخر مصنوع يدوي — للفنانين والمبدعين في مصر.'
        : 'Warm, hand-made sketchbooks and paper goods built for artists and thinkers.',
      images: [`${SITE_URL}/lifestyle/hero-fullbleed.jpg`],
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
      className={`${fraunces.variable} ${inter.variable} ${tajawal.variable}${isRTL ? ' rtl' : ''}`}
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
            </CartProvider>
          </PostHogProvider>
        </LanguageProvider>
        <JsonLd data={[organizationSchema(), webSiteSchema(l)]} />
        <Analytics />
      </body>
    </html>
  );
}
