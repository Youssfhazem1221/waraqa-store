'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function BrandStory() {
  const { t, lp } = useLanguage();

  return (
    <section aria-labelledby="story-title" className="border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <div className="lg:col-span-5 relative aspect-4/5 overflow-hidden bg-kraft/30">
          <Image
            src="/lifestyle/lifestyle-1.jpeg"
            alt="A Waraqa kraft sketchbook on a wooden table"
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover object-center"
          />
        </div>

        <div className="lg:col-span-7 max-w-xl">
          <p className="text-sm text-muted">{t.story.badge}</p>
          <h2 id="story-title" className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-maroon leading-tight">
            {t.story.title}
          </h2>
          <div className="mt-6 space-y-4 text-char/85 leading-relaxed">
            <p>{t.story.p1}</p>
            <p>{t.story.p2}</p>
          </div>
          <Link
            href={lp('/about')}
            className="inline-block mt-6 text-maroon underline underline-offset-4 decoration-1 hover:decoration-2"
          >
            {t.story.learnMore}
          </Link>

          {/* Delivery and payment facts sit here as plain lines instead of a
              separate row of icon cards. */}
          <dl className="mt-10 grid sm:grid-cols-3 gap-6 pt-6 border-t border-line text-sm">
            {[
              [t.trust.shippingTitle, t.trust.shippingDesc],
              [t.trust.ecoTitle, t.trust.ecoDesc],
              [t.trust.secureTitle, t.trust.secureDesc],
            ].map(([title, desc]) => (
              <div key={title}>
                <dt className="font-semibold text-char">{title}</dt>
                <dd className="mt-1 text-muted leading-relaxed">{desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
