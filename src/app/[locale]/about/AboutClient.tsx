'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { buttonClasses } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';

export default function AboutClient() {
  const { t, lp } = useLanguage();

  const principles = [
    [t.about.pNatural, t.about.pNaturalDesc],
    [t.about.pTactile, t.about.pTactileDesc],
    [t.about.pUnhurried, t.about.pUnhurriedDesc],
    [t.about.pHonest, t.about.pHonestDesc],
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="text-sm text-muted">{t.about.badge}</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-6xl font-semibold text-maroon leading-[1.02]">
          {t.about.title}
        </h1>
        <p className="mt-5 text-lg sm:text-xl text-char/80">{t.about.subtitle}</p>
      </header>

      <div className="mt-12 relative aspect-16/9 overflow-hidden bg-kraft/30">
        <Image
          src="/lifestyle/lifestyle-3.jpeg"
          alt="Hands holding three Waraqa kraft sketchbooks"
          fill
          fetchPriority="high"
          loading="eager"
          sizes="(max-width: 1152px) 100vw, 1152px"
          className="object-cover object-center"
        />
      </div>

      <div className="mt-16 grid md:grid-cols-2 gap-x-16 gap-y-12">
        <section>
          <p className="font-serif text-maroon text-lg">{t.about.sec1Num}</p>
          <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-char">{t.about.sec1Title}</h2>
          <p className="mt-4 text-char/85 leading-relaxed">{t.story.p1}</p>
        </section>

        <section>
          <p className="font-serif text-maroon text-lg">{t.about.sec2Num}</p>
          <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-char">{t.about.sec2Title}</h2>
          <div className="mt-4 space-y-4 text-char/85 leading-relaxed">
            <p>
              <strong className="font-semibold text-char">{t.about.voice1Title}</strong> {t.about.voice1Desc}
            </p>
            <p>
              <strong className="font-semibold text-char">{t.about.voice2Title}</strong> {t.about.voice2Desc}
            </p>
          </div>
        </section>
      </div>

      <section className="mt-16 pt-10 border-t border-line">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-char">{t.about.principlesTitle}</h2>
        <dl className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {principles.map(([title, desc]) => (
            <div key={title} className="border-t border-char/20 pt-4">
              <dt className="font-semibold text-char">{title}</dt>
              <dd className="mt-1 text-sm text-muted leading-relaxed">{desc}</dd>
            </div>
          ))}
        </dl>
        <Link href={lp('/shop')} className={buttonClasses({ size: 'lg', className: 'mt-12' })}>
          {t.about.exploreBtn}
        </Link>
      </section>
    </div>
  );
}
