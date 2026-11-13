import React from 'react';
import type { Metadata } from 'next';
import { translations } from '@/lib/translations';
import { isLocale, DEFAULT_LOCALE, seoAlternates, absoluteUrl, ogDefaults } from '@/lib/seo';
import { faqSchema, breadcrumbSchema } from '@/lib/schema';
import { getStorefront } from '@/lib/catalog';
import { fillRatesInFaq, homeRates } from '@/lib/shipping-copy';
import JsonLd from '@/components/seo/JsonLd';
import AboutClient from './AboutClient';

type Params = { params: Promise<{ locale: string }> };

// The FAQ markup quotes delivery fees from the live shipping zones (edited in
// the CRM), so the page renders per request instead of freezing build-time rates.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = translations[l];
  return {
    title: t.about.title,
    description: t.about.metaDescription,
    alternates: seoAlternates(l, '/about'),
    openGraph: {
      title: t.about.title,
      description: t.about.metaDescription,
      url: absoluteUrl(l, '/about'),
      ...ogDefaults(l),
    },
  };
}

export default async function AboutPage({ params }: Params) {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = translations[l];
  const { zones } = await getStorefront();

  return (
    <>
      <AboutClient />
      <JsonLd
        data={[
          faqSchema(fillRatesInFaq(t.faq.items, homeRates(zones), l), l),
          breadcrumbSchema(l, [
            { name: t.nav.home, path: '/' },
            { name: t.nav.about, path: '/about' },
          ]),
        ]}
      />
    </>
  );
}
