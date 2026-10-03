import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { translations } from '@/lib/translations';
import { isLocale, DEFAULT_LOCALE, seoAlternates, absoluteUrl, ogLocale, localePath } from '@/lib/seo';
import { breadcrumbSchema } from '@/lib/schema';
import { POSTS, formatDate } from '@/data/blog';
import JsonLd from '@/components/seo/JsonLd';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = translations[l];
  return {
    title: { absolute: t.blog.metaTitle },
    description: t.blog.description,
    alternates: seoAlternates(l, '/blog'),
    openGraph: {
      title: t.blog.metaTitle,
      description: t.blog.description,
      url: absoluteUrl(l, '/blog'),
      ...ogLocale(l),
    },
  };
}

export default async function BlogIndex({ params }: Params) {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = translations[l];
  const isAr = l === 'ar';
  const posts = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <section className="border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-6">
          <h1 className="font-serif font-semibold text-maroon text-4xl sm:text-5xl tracking-tight">{t.blog.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-char/90">{t.blog.intro}</p>
        </div>
        <ul className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6 grid sm:grid-cols-2 gap-x-8 gap-y-12">
          {posts.map((p, i) => {
            const c = p[l];
            return (
              <li key={p.slug}>
                <Link href={localePath(l, `/blog/${p.slug}`)} className="group block">
                  <div className="relative aspect-16/10 overflow-hidden bg-kraft/30">
                    <Image
                      src={p.image}
                      alt=""
                      aria-hidden
                      fill
                      priority={i < 2}
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="mt-4 text-xs text-muted">
                    <time dateTime={p.date}>{formatDate(p.date, isAr)}</time> · {isAr ? p.minutes.toLocaleString('ar-EG') : p.minutes} {t.blog.minRead}
                  </p>
                  <h2 className="mt-2 font-serif text-2xl font-semibold text-char group-hover:text-maroon leading-snug">{c.title}</h2>
                  <p className="mt-2 text-char/80 leading-relaxed">{c.excerpt}</p>
                  <span className="mt-3 inline-block text-maroon underline underline-offset-4 decoration-1">{t.blog.read}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      <JsonLd
        data={[
          breadcrumbSchema(l, [
            { name: t.nav.home, path: '/' },
            { name: t.blog.title, path: '/blog' },
          ]),
        ]}
      />
    </>
  );
}
