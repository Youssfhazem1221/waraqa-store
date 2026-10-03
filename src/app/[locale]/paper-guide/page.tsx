import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { translations } from '@/lib/translations';
import { isLocale, DEFAULT_LOCALE, seoAlternates, absoluteUrl, ogLocale, localePath } from '@/lib/seo';
import { articleSchema, breadcrumbSchema } from '@/lib/schema';
import { getCatalog } from '@/lib/catalog';
import { shortName } from '@/lib/api';
import { formatAmount } from '@/lib/money';
import { WHATSAPP_NUMBER } from '@/lib/constants';
import { PAPER_GUIDE } from '@/data/paperGuide';
import JsonLd from '@/components/seo/JsonLd';

type Params = { params: Promise<{ locale: string }> };

// Prices on this page come from the live catalog, like every other price page.
export const dynamic = 'force-dynamic';

const PUBLISHED = '2026-10-04';

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const c = PAPER_GUIDE[l];
  return {
    title: { absolute: c.title },
    description: c.description,
    alternates: seoAlternates(l, '/paper-guide'),
    openGraph: {
      title: c.title,
      description: c.description,
      url: absoluteUrl(l, '/paper-guide'),
      type: 'article',
      images: [{ url: '/guide/wash.jpg', width: 1600, height: 893 }],
      ...ogLocale(l),
    },
  };
}

export default async function PaperGuidePage({ params }: Params) {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = translations[l];
  const c = PAPER_GUIDE[l];
  const isAr = l === 'ar';
  const lp = (p: string) => localePath(l, p);
  const products = (await getCatalog()).filter((p) => p.status !== 'Hidden');

  const toc = [
    ...c.sections.map((s) => ({ id: s.key, label: s.title })),
    { id: 'kraft', label: c.kraftHeading },
    { id: 'sizes', label: c.sizesHeading },
    { id: 'quick', label: c.quickHeading },
  ];

  return (
    <>
      <article className="border-b border-line">
        <header className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-10">
          <p className="text-sm text-terra font-semibold">{c.eyebrow}</p>
          <h1 className="mt-3 font-serif font-semibold text-maroon text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight max-w-3xl text-balance">
            {c.h1}
          </h1>
          <div className="mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-char">
            {c.intro.map((p) => <p key={p}>{p}</p>)}
          </div>
          <nav aria-label={t.paperGuide.onThisPage} className="mt-8">
            <p className="text-xs uppercase tracking-wider text-muted">{t.paperGuide.onThisPage}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {toc.map((x) => (
                <li key={x.id}>
                  <a href={`#${x.id}`} className="inline-block border border-line bg-white/60 px-3 py-1.5 text-sm text-char hover:border-maroon hover:text-maroon">
                    {x.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        {/* Weight table */}
        <section aria-labelledby="gsm-title" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <h2 id="gsm-title" className="font-serif text-2xl sm:text-3xl font-semibold text-char">{c.gsmHeading}</h2>
          <p className="mt-2 text-muted max-w-2xl">{c.gsmIntro}</p>
          <div className="mt-6 overflow-x-auto border border-line bg-white/50">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-start text-muted">
                  <th scope="col" className="text-start font-semibold px-4 py-3 border-b border-line">{c.gsmCols.gsm}</th>
                  <th scope="col" className="text-start font-semibold px-4 py-3 border-b border-line">{c.gsmCols.feel}</th>
                  <th scope="col" className="text-start font-semibold px-4 py-3 border-b border-line">{c.gsmCols.bestFor}</th>
                </tr>
              </thead>
              <tbody>
                {c.gsmTable.map((r) => (
                  <tr key={r.gsm} className="border-b border-line last:border-b-0 align-top">
                    <th scope="row" className="text-start px-4 py-3 font-semibold text-maroon whitespace-nowrap">{r.gsm}</th>
                    <td className="px-4 py-3 text-char">{r.feel}</td>
                    <td className="px-4 py-3 text-char">{r.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* One band per medium, each on its own paper texture */}
        {c.sections.map((s, si) => {
          const items = products
            .filter((p) => p.gsm >= s.min && p.gsm <= s.max)
            .sort((a, b) => a.gsm - b.gsm || a.price - b.price);
          return (
            <section key={s.key} id={s.key} aria-labelledby={`${s.key}-title`} className="relative isolate scroll-mt-20 border-t border-line overflow-hidden">
              <Image
                src={s.texture}
                alt=""
                aria-hidden
                fill
                priority={si === 0}
                sizes="100vw"
                className={`-z-10 object-cover object-right ${isAr ? '-scale-x-100' : ''}`}
              />
              <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r rtl:bg-gradient-to-l from-cream via-cream/90 to-cream/20" />
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7">
                  <p className="font-serif text-maroon text-3xl font-semibold">{s.weight}</p>
                  <h2 id={`${s.key}-title`} className="mt-1 font-serif text-3xl sm:text-4xl font-semibold text-char">{s.title}</h2>
                  <p className="mt-3 text-lg text-char">{s.lede}</p>
                  <div className="mt-4 space-y-4 leading-relaxed text-char/90">
                    {s.paras.map((p) => <p key={p}>{p}</p>)}
                  </div>
                  <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted">{c.tipsLabel}</h3>
                  <ul className="mt-2 space-y-2 text-char/90">
                    {s.tips.map((tip) => (
                      <li key={tip} className="flex gap-3"><span aria-hidden className="text-terra">✶</span><span>{tip}</span></li>
                    ))}
                  </ul>
                </div>
                <aside className="lg:col-span-5 self-end">
                  <div className="bg-cream/95 border border-line p-5 shadow-[0_10px_24px_rgba(32,21,19,.10)]">
                    <h3 className="text-sm font-semibold text-char">{c.matchingLabel}</h3>
                    <ul className="mt-3 divide-y divide-line">
                      {items.length === 0 && <li className="py-3 text-sm text-muted">{t.guide.none}</li>}
                      {items.map((p) => {
                        const soldOut = p.stock <= 0 || p.status !== 'Active';
                        const name = isAr ? p.nameAr || p.name : p.name;
                        return (
                          <li key={p.sku}>
                            <Link href={lp(`/product/${p.slug}`)} className="flex items-center gap-3 py-3 group">
                              <span className="relative w-12 aspect-4/5 shrink-0">
                                <Image src={p.image} alt={name} fill sizes="48px" className="object-contain" />
                              </span>
                              <span className="flex-1 text-sm text-char group-hover:text-maroon group-hover:underline underline-offset-4">
                                {shortName(name)}
                                <span className="block text-xs text-muted">{p.gsm} {isAr ? 'جرام' : 'gsm'} · {p.sheets} {isAr ? 'ورقة' : 'sheets'}</span>
                              </span>
                              <span className={`text-sm tabular-nums ${soldOut ? 'text-muted' : 'text-maroon font-semibold'}`}>
                                {soldOut ? t.common.soldOut : `${formatAmount(p.price)} ${t.common.currency}`}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </aside>
              </div>
            </section>
          );
        })}

        <section id="kraft" aria-labelledby="kraft-title" className="scroll-mt-20 border-t border-line">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <h2 id="kraft-title" className="font-serif text-3xl font-semibold text-char">{c.kraftHeading}</h2>
              <div className="mt-4 space-y-4 leading-relaxed text-char/90">
                {c.kraftParas.map((p) => <p key={p}>{p}</p>)}
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-4/5 max-w-sm mx-auto">
                <Image src="/lifestyle/lifestyle-1.jpeg" alt={isAr ? 'سكتش بوك كرافت من ورقة في الإيد' : 'A Waraqa kraft sketchbook in hand'} fill sizes="(max-width: 1024px) 80vw, 380px" className="object-cover" />
              </div>
            </div>
          </div>
        </section>

        <section id="sizes" aria-labelledby="sizes-title" className="scroll-mt-20 border-t border-line bg-kraft/15">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <h2 id="sizes-title" className="font-serif text-3xl font-semibold text-char">{c.sizesHeading}</h2>
            <dl className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {c.sizes.map((s) => (
                <div key={s.name} className="bg-cream border border-line p-5">
                  <dt className="font-semibold text-maroon">{s.name}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-char/90">{s.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="quick" aria-labelledby="quick-title" className="scroll-mt-20 border-t border-line">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7">
              <h2 id="quick-title" className="font-serif text-3xl font-semibold text-char">{c.quickHeading}</h2>
              <dl className="mt-6 divide-y divide-line border-y border-line">
                {c.quick.map((x) => (
                  <div key={x.q} className="py-4">
                    <dt className="font-semibold text-char">{x.q}</dt>
                    <dd className="mt-1.5 text-char/85 leading-relaxed">{x.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="lg:col-span-5 self-start bg-maroon text-cream p-7">
              <h2 className="font-serif text-2xl font-semibold">{c.outroHeading}</h2>
              <p className="mt-3 text-cream/85 leading-relaxed">{c.outro}</p>
              <div className="mt-6 flex flex-col gap-3">
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="inline-flex justify-center bg-cream text-maroon px-5 py-3 font-medium hover:bg-white">
                  {t.paperGuide.whatsapp}
                </a>
                <Link href={lp('/shop')} className="inline-flex justify-center border border-cream/60 px-5 py-3 font-medium hover:bg-cream/10">
                  {t.paperGuide.shopAll}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </article>

      <JsonLd
        data={[
          articleSchema(l, {
            type: 'Article',
            path: '/paper-guide',
            headline: c.h1,
            description: c.description,
            image: '/guide/wash.jpg',
            datePublished: PUBLISHED,
          }),
          breadcrumbSchema(l, [
            { name: t.nav.home, path: '/' },
            { name: t.nav.paperGuide, path: '/paper-guide' },
          ]),
        ]}
      />
    </>
  );
}
