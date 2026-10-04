import React from 'react';
import type { Metadata } from 'next';
import { translations } from '@/lib/translations';
import { getLegalDoc } from '@/lib/legal';
import { isLocale, DEFAULT_LOCALE, seoAlternates, absoluteUrl, ogDefaults } from '@/lib/seo';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';
import LegalDocument from '@/components/legal/LegalDocument';

type Params = { params: Promise<{ locale: string }> };

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

  return (
    <>
      <LegalDocument locale={l} slug="shipping" />
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
