import React from 'react';
import type { Metadata } from 'next';
import { translations } from '@/lib/translations';
import { isLocale, DEFAULT_LOCALE, seoAlternates, absoluteUrl, ogLocale } from '@/lib/seo';
import HomeClient from './HomeClient';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = translations[l];
  return {
    title: `${t.hero.titleLine1} ${t.hero.titleLine2}`,
    description: t.hero.subtitle,
    alternates: seoAlternates(l, '/'),
    openGraph: {
      title: `${t.hero.titleLine1} ${t.hero.titleLine2}`,
      description: t.hero.subtitle,
      url: absoluteUrl(l, '/'),
      ...ogLocale(l),
    },
  };
}

export default async function HomePage({ params }: Params) {
  await params;
  return <HomeClient />;
}
