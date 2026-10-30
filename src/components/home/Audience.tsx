'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber } from '@/lib/format';

export default function Audience() {
  const { t, locale } = useLanguage();

  const rows = [
    { n: 1, title: t.audience.beginnerTitle, desc: t.audience.beginnerDesc },
    { n: 2, title: t.audience.studentTitle, desc: t.audience.studentDesc },
  ];

  return (
    <section aria-labelledby="audience-title" className="border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 grid lg:grid-cols-12 gap-8">
        <h2 id="audience-title" className="lg:col-span-4 font-serif text-3xl sm:text-4xl font-semibold text-char">
          {t.audience.title}
        </h2>
        <div className="lg:col-span-8 divide-y divide-line border-y border-line">
          {rows.map((r) => (
            <div key={r.n} className="py-6 grid sm:grid-cols-[3rem_1fr] gap-2">
              <span className="text-maroon text-lg tabular-nums">{formatNumber(r.n, locale, 2)}</span>
              <div>
                <h3 className="font-semibold text-char text-lg">{r.title}</h3>
                <p className="mt-1.5 text-muted leading-relaxed">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
