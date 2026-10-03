import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { translations } from '@/lib/translations';
import { isLocale, DEFAULT_LOCALE, seoAlternates, absoluteUrl, ogLocale, localePath } from '@/lib/seo';
import { articleSchema, breadcrumbSchema } from '@/lib/schema';
import { getCatalog } from '@/lib/catalog';
import { shortName } from '@/lib/api';
import { formatAmount } from '@/lib/money';
import { POSTS, getPost, formatDate, type Block } from '@/data/blog';
import JsonLd from '@/components/seo/JsonLd';

type Params = { params: Promise<{ locale: string; slug: string }> };

// Post copy is static, but the product rail at the end shows live prices.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const post = getPost(slug);
  if (!post) return {};
  const c = post[l];
  const path = `/blog/${post.slug}`;
  return {
    title: c.title,
    description: c.description,
    alternates: seoAlternates(l, path),
    openGraph: {
      title: c.title,
      description: c.description,
      url: absoluteUrl(l, path),
      type: 'article',
      publishedTime: post.date,
      images: [{ url: post.image }],
      ...ogLocale(l),
    },
  };
}

function renderBlock(b: Block, i: number) {
  if ('h2' in b) return <h2 key={i} className="mt-10 font-serif text-2xl sm:text-3xl font-semibold text-char">{b.h2}</h2>;
  if ('list' in b)
    return (
      <ul key={i} className="mt-4 space-y-2">
        {b.list.map((x) => (
          <li key={x} className="flex gap-3"><span aria-hidden className="text-terra mt-0.5">✶</span><span>{x}</span></li>
        ))}
      </ul>
    );
  if ('tip' in b) return <p key={i} className="mt-8 border-s-4 border-terra bg-kraft/15 px-5 py-4 text-char">{b.tip}</p>;
  return <p key={i} className="mt-4">{b.p}</p>;
}

export default async function BlogPost({ params }: Params) {
  const { locale, slug } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const post = getPost(slug);
  if (!post) notFound();
  const t = translations[l];
  const c = post[l];
  const isAr = l === 'ar';
  const path = `/blog/${post.slug}`;
  const catalog = await getCatalog();
  const related = post.products
    .map((s) => catalog.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => !!p && p.status !== 'Hidden');
  const others = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <article className="border-b border-line">
        <header className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
          <Link href={localePath(l, '/blog')} className="text-sm text-muted hover:text-maroon">{t.blog.allPosts}</Link>
          <h1 className="mt-4 font-serif font-semibold text-maroon text-3xl sm:text-5xl leading-[1.1] tracking-tight text-balance">{c.title}</h1>
          <p className="mt-4 text-sm text-muted">
            {t.blog.published} <time dateTime={post.date}>{formatDate(post.date, isAr)}</time> · {isAr ? post.minutes.toLocaleString('ar-EG') : post.minutes} {t.blog.minRead}
          </p>
        </header>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
          <div className="relative aspect-16/9 overflow-hidden bg-kraft/30">
            <Image src={post.image} alt="" aria-hidden fill priority sizes="(max-width: 896px) 100vw, 896px" className="object-cover" />
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-lg leading-relaxed text-char/90">
          <p className="text-xl text-char">{c.excerpt}</p>
          {c.body.map(renderBlock)}

          <p className="mt-10">
            <Link href={localePath(l, '/paper-guide')} className="text-maroon underline underline-offset-4">{t.blog.guideCta}</Link>
          </p>

          {related.length > 0 && (
            <aside className="mt-10 border border-line bg-white/50 p-5">
              <h2 className="text-sm font-semibold text-char">{t.blog.related}</h2>
              <ul className="mt-3 divide-y divide-line text-base">
                {related.map((p) => {
                  const name = isAr ? p.nameAr || p.name : p.name;
                  const soldOut = p.stock <= 0 || p.status !== 'Active';
                  return (
                    <li key={p.sku}>
                      <Link href={localePath(l, `/product/${p.slug}`)} className="flex items-center gap-4 py-3 group">
                        <span className="relative w-14 aspect-4/5 shrink-0">
                          <Image src={p.image} alt={name} fill sizes="56px" className="object-contain" />
                        </span>
                        <span className="flex-1 text-char group-hover:text-maroon group-hover:underline underline-offset-4">{shortName(name)}</span>
                        <span className={`tabular-nums text-sm ${soldOut ? 'text-muted' : 'text-maroon font-semibold'}`}>
                          {soldOut ? t.common.soldOut : `${formatAmount(p.price)} ${t.common.currency}`}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </aside>
          )}
        </div>
      </article>

      {others.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-serif text-2xl font-semibold text-char">{t.blog.title}</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {others.map((p) => (
              <li key={p.slug}>
                <Link href={localePath(l, `/blog/${p.slug}`)} className="block py-4 group">
                  <span className="font-semibold text-char group-hover:text-maroon">{p[l].title}</span>
                  <span className="block mt-1 text-sm text-muted">{p[l].excerpt}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <JsonLd
        data={[
          articleSchema(l, {
            type: 'BlogPosting',
            path,
            headline: c.title,
            description: c.description,
            image: post.image,
            datePublished: post.date,
            dateModified: post.updated,
          }),
          breadcrumbSchema(l, [
            { name: t.nav.home, path: '/' },
            { name: t.blog.title, path: '/blog' },
            { name: c.title, path },
          ]),
        ]}
      />
    </>
  );
}
