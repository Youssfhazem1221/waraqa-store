import type { Metadata } from 'next';
import { isLocale, DEFAULT_LOCALE, seoAlternates } from '@/lib/seo';
import { translations } from '@/lib/translations';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return {
    title: translations[l].checkout.metaTitle,
    robots: { index: false, follow: true },
    alternates: seoAlternates(l, '/checkout'),
  };
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
