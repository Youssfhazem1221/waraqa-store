'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { buttonClasses } from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { useLanguage } from '@/context/LanguageContext';

export default function HeroSection() {
  const { t, isRTL } = useLanguage();

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate w-full min-h-[78vh] sm:min-h-[82vh] flex items-center justify-center overflow-hidden bg-esp"
    >
      {/* Full-bleed photograph. Decorative: it sets mood behind copy that already
          says everything, so an empty alt keeps it out of the screen-reader path
          rather than making non-visual users sit through a scene description. */}
      <Image
        src="/lifestyle/hero-fullbleed.jpg"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="object-cover object-center -z-10"
      />

      {/* Scrim stack: an even wash for baseline legibility, a bottom-weighted
          gradient to seat the copy, and a soft vignette to pull the eye in.
          Doing the work here means the copy needs no panel behind it. */}
      <div className="absolute inset-0 -z-10 bg-esp/45" aria-hidden />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-esp via-esp/55 to-esp/15"
        aria-hidden
      />

      {/* Content */}
      <div className="relative w-full max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-24 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 border border-cream/25 bg-cream/10 backdrop-blur-sm px-3.5 py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-cream">
          <Icon name="leaf" size={13} className="text-sage" />
          <span>{t.hero.badge}</span>
        </div>

        {/* Headline */}
        <h1
          id="hero-title"
          className="mt-7 font-serif text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-7xl font-bold tracking-tight text-cream"
        >
          {t.hero.titleLine1}{' '}
          <span className="italic text-kraft">{t.hero.titleLine2}</span>
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-5 text-lg sm:text-2xl font-medium text-cream/95 ${
            isRTL ? 'font-arabic' : ''
          }`}
        >
          {t.hero.subtitle}
        </p>

        {/* Description */}
        <p className="mt-4 mx-auto max-w-xl text-sm sm:text-base leading-relaxed text-cream/90">
          {t.hero.description}
        </p>

        {/* Actions */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* These are links, styled as buttons — NOT <Button> wrapped in <Link>.
              Nesting a button inside an anchor is invalid HTML: focus lands on
              the anchor, so the button's focus ring never fires for keyboard
              users. Focus rings are forced to cream here because the shared
              maroon ring is invisible against this photograph. */}
          <Link
            href="/shop"
            className={buttonClasses({
              size: 'lg',
              fullWidth: true,
              className:
                'sm:w-auto shadow-xl shadow-esp/40 focus-visible:ring-cream! focus-visible:ring-offset-2 focus-visible:ring-offset-esp',
            })}
          >
            <Icon name="bag" size={18} />
            <span>{t.hero.shopCta}</span>
          </Link>
          <Link
            href="/about"
            className={buttonClasses({
              size: 'lg',
              fullWidth: true,
              className:
                'sm:w-auto bg-transparent! text-cream! border-2! border-cream/70! backdrop-blur-sm hover:bg-cream! hover:text-esp! hover:border-cream! shadow-none focus-visible:ring-cream! focus-visible:ring-offset-2 focus-visible:ring-offset-esp',
            })}
          >
            <span>{t.hero.storyCta}</span>
            <Icon name={isRTL ? 'chevron-left' : 'arrow-right'} size={16} />
          </Link>
        </div>

        {/* Spec bar — single row on desktop, separated by hairlines */}
        <ul
          aria-label="What every Waraqa sketchbook comes with"
          className="mt-12 pt-6 border-t border-cream/20 flex flex-wrap items-center justify-center gap-y-3 text-xs sm:text-sm font-medium text-cream/90"
        >
          <li className="flex items-center gap-2 px-4 sm:px-5">
            <Icon name="leaf" size={15} className="text-sage shrink-0" />
            <span>{t.hero.specAcidFree}</span>
          </li>
          <li className="flex items-center gap-2 px-4 sm:px-5 sm:border-s sm:border-cream/20">
            <Icon name="truck" size={15} className="text-kraft shrink-0" />
            <span>{t.hero.specDelivery}</span>
          </li>
          <li className="flex items-center gap-2 px-4 sm:px-5 sm:border-s sm:border-cream/20">
            <Icon name="card" size={15} className="text-terra shrink-0" />
            <span>{t.hero.specCod}</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
