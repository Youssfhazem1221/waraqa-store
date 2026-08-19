import type { Metadata } from 'next';
import { Fraunces, Inter, Tajawal } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

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

export const metadata: Metadata = {
  title: {
    default: 'Waraqa (ورقة) — Premium Sketchbooks & Paper Goods',
    template: '%s · Waraqa (ورقة)',
  },
  description:
    'An identity for sketchbooks and paper goods. Warm, hand-made, and quietly confident. High-gsm mixed media, kraft, and drawing sketchbooks in Egypt.',
  keywords: [
    'sketchbook',
    'sketchbooks Egypt',
    'Waraqa',
    'ورقة',
    'دفتر رسم',
    'سكتش بوك',
    'mixed media paper',
    'kraft sketchbook',
    'art supplies Egypt',
    'watercolor paper',
  ],
  authors: [{ name: 'Waraqa' }],
  icons: {
    icon: '/logos/waraqa-1x1-dark-cream.svg',
    apple: '/logos/waraqa-1x1-dark-1024.png',
  },
  openGraph: {
    title: 'Waraqa (ورقة) — Premium Sketchbooks & Paper Goods',
    description: 'Warm, hand-made sketchbooks and paper goods built for artists and thinkers.',
    url: 'https://waraqa.store',
    siteName: 'Waraqa',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${tajawal.variable}`}
    >
      <body className="bg-cream text-char antialiased min-h-screen flex flex-col selection:bg-maroon selection:text-cream font-sans">
        <LanguageProvider>
          <CartProvider>
            <AnnouncementBar />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
