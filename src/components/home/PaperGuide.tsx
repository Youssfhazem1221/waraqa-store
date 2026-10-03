'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { formatAmount } from '@/lib/money';
import { shortName } from '@/lib/api';

export default function PaperGuide({ products }: { products: Product[] }) {
  const { t, isRTL, lp } = useLanguage();

  const groups = useMemo(() => {
    const available = products.filter((p) => p.status !== 'Hidden');
    const band = (min: number, max: number) =>
      available.filter((p) => p.gsm >= min && p.gsm <= max).sort((a, b) => a.gsm - b.gsm || a.price - b.price);
    return [
      { key: 'dry', anchor: 'pencil', texture: '/guide/pencil.jpg', title: t.guide.dryTitle, weight: t.guide.dryWeight, desc: t.guide.dryDesc, items: band(0, 180) },
      { key: 'ink', anchor: 'ink', texture: '/guide/ink.jpg', title: t.guide.inkTitle, weight: t.guide.inkWeight, desc: t.guide.inkDesc, items: band(181, 299) },
      { key: 'wet', anchor: 'watercolour', texture: '/guide/wash.jpg', title: t.guide.wetTitle, weight: t.guide.wetWeight, desc: t.guide.wetDesc, items: band(300, 9999) },
    ];
  }, [products, t]);

  return (
    <section id="paper-guide" aria-labelledby="guide-title" className="border-b border-line scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 id="guide-title" className="font-serif text-3xl sm:text-4xl font-semibold text-char">
            {t.guide.title}
          </h2>
          <p className="mt-3 text-muted">{t.guide.intro}</p>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {groups.map((g) => (
            <div key={g.key} className="relative isolate overflow-hidden border border-line bg-cream">
              {/* Each card sits on a sample of what that paper is for: graphite,
                  pen and marker, watercolour. The texture fades out before the
                  text so the copy stays on clean paper. */}
              <div aria-hidden className="relative h-36 sm:h-40 -z-10">
                <Image
                  src={g.texture}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={`object-cover object-right ${isRTL ? '-scale-x-100' : ''}`}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cream/10 to-cream" />
              </div>
              <div className="px-6 pb-6 -mt-6">
              <p className="font-serif text-maroon text-2xl">{g.weight}</p>
              <h3 className="mt-1 font-semibold text-char">{g.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{g.desc}</p>

              <ul className="mt-5 text-sm">
                {g.items.length === 0 && <li className="text-muted">{t.guide.none}</li>}
                {g.items.map((p) => {
                  const soldOut = p.stock <= 0 || p.status !== 'Active';
                  const name = isRTL ? p.nameAr || p.name : p.name;
                  return (
                    <li key={p.sku} className="border-t border-line first:border-t-0">
                      <Link
                        href={lp(`/product/${p.slug}`)}
                        className="flex items-baseline justify-between gap-4 py-2.5 group"
                      >
                        <span className="text-char group-hover:text-maroon group-hover:underline underline-offset-4">
                          {shortName(name)}
                        </span>
                        <span className={`tabular-nums shrink-0 ${soldOut ? 'text-muted' : 'text-char'}`}>
                          {soldOut ? t.common.soldOut : `${formatAmount(p.price)} ${t.common.currency}`}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link
                href={lp(`/paper-guide#${g.anchor}`)}
                className="mt-4 inline-block text-sm text-maroon underline underline-offset-4 decoration-1 hover:decoration-2"
              >
                {t.guide.fullGuide}
              </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
