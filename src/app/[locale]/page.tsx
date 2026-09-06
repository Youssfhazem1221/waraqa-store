import React from 'react';
import type { Metadata } from 'next';
import { isLocale, DEFAULT_LOCALE, seoAlternates, absoluteUrl, ogLocale } from '@/lib/seo';
import HomeClient from './HomeClient';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const isAr = l === 'ar';
  return {
    title: isAr
      ? 'ورقة — سكتش بوك وورق رسم مصنوع يدوي في مصر'
      : 'Waraqa (ورقة) — Handmade Sketchbooks & Art Paper in Egypt',
    description: isAr
      ? 'سكتش بوك وورق رسم فاخر مصنوع يدوي في القاهرة. ورق سميك من ١٥٠ لـ ٣٢٠ جرام — مكسد ميديا، كرافت، ورسم. توصيل لكل مصر.'
      : 'Handmade sketchbooks and art paper in Cairo. Heavy 150–320gsm mixed media, kraft, and drawing paper. Free delivery in Cairo & Giza.',
    alternates: seoAlternates(l, '/'),
    openGraph: {
      title: isAr
        ? 'ورقة — سكتش بوك وورق رسم مصنوع يدوي في مصر'
        : 'Waraqa (ورقة) — Handmade Sketchbooks & Art Paper in Egypt',
      description: isAr
        ? 'سكتش بوك وورق رسم فاخر مصنوع يدوي — للفنانين والمبدعين في مصر.'
        : 'Warm, hand-made sketchbooks and paper goods built for artists and thinkers.',
      url: absoluteUrl(l, '/'),
      ...ogLocale(l),
    },
  };
}

export default async function HomePage({ params }: Params) {
  await params;
  return <HomeClient />;
}
