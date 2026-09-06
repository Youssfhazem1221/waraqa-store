import React from 'react';
import type { Metadata } from 'next';
import type { Product } from '@/types';
import productsData from '@/data/products.json';
import { translations } from '@/lib/translations';
import { isLocale, DEFAULT_LOCALE, seoAlternates, absoluteUrl, ogLocale } from '@/lib/seo';
import { itemListSchema, breadcrumbSchema } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';
import ShopClient from './ShopClient';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = translations[l];
  return {
    title: t.shop.title,
    description: t.shop.description,
    alternates: seoAlternates(l, '/shop'),
    openGraph: {
      title: t.shop.title,
      description: t.shop.description,
      url: absoluteUrl(l, '/shop'),
      ...ogLocale(l),
    },
  };
}

export default async function ShopPage({ params }: Params) {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const products = productsData as Product[];

  return (
    <>
      <ShopClient />
      {/* Listed from the bundled catalog, not the client's live fetch: this markup
          has to be in the server response to be read at all. */}
      <JsonLd
        data={[
          itemListSchema(products, l),
          breadcrumbSchema(l, [
            { name: translations[l].nav.home, path: '/' },
            { name: translations[l].nav.shop, path: '/shop' },
          ]),
        ]}
      />
    </>
  );
}
