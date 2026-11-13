import React from 'react';
import type { Metadata } from 'next';
import { translations } from '@/lib/translations';
import { getLegalDoc } from '@/lib/legal';
import { isLocale, DEFAULT_LOCALE, seoAlternates, absoluteUrl, ogDefaults } from '@/lib/seo';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';
import LegalDocument from '@/components/legal/LegalDocument';
import { getStorefront } from '@/lib/catalog';

type Params = { params: Promise<{ locale: string }> };

// The fees come from the live shipping zones (edited in the CRM), so the page
// renders per request like the shop, instead of freezing build-time rates.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const doc = getLegalDoc(l, 'shipping');
  return {
    title: doc.title,
    description: doc.description,
    alternates: seoAlternates(l, '/shipping'),
    openGraph: {
      title: doc.title,
      description: doc.description,
      url: absoluteUrl(l, '/shipping'),
      ...ogDefaults(l),
    },
  };
}

export default async function Page({ params }: Params) {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const doc = getLegalDoc(l, 'shipping');
  const { zones, shippingUpdatedAt } = await getStorefront();

  return (
    <>
      <LegalDocument locale={l} slug="shipping" zones={zones} shippingUpdatedAt={shippingUpdatedAt} />
      <JsonLd
        data={[
          breadcrumbSchema(l, [
            { name: translations[l].nav.home, path: '/' },
            { name: doc.title, path: '/shipping' },
          ]),
        ]}
      />
    </>
  );
}
