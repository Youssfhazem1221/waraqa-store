'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { useLanguage } from '@/context/LanguageContext';

export default function HeroSection() {
  const { t, isRTL } = useLanguage();

  return (
    <section className="relative overflow-hidden border-b border-line bg-[#FAF5EE] py-12 sm:py-20 lg:py-24">
      {/* Background ambient gradient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 -z-10 transform-gpu blur-3xl sm:-top-80"
      >
        <div
          className="aspect-1097/845 w-[68.4375rem] bg-gradient-to-tr from-[#C0A286]/30 to-[#4C2224]/10 opacity-60"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column — Content & Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
            
            {/* Brand Kicker Badge */}
            <div className="inline-flex items-center gap-2.5 bg-white/80 backdrop-blur-xs border border-line px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest text-maroon shadow-2xs">
              <div className="w-5 h-5 relative flex-shrink-0">
                <Image
                  src="/logos/waraqa-1x1-dark.svg"
                  alt="Waraqa symbol"
                  fill
                  className="object-contain"
                />
              </div>
              <span>{t.hero.badge}</span>
            </div>

            {/* Headline Group */}
            <div className="space-y-3">
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-maroon leading-[1.06]">
                {t.hero.titleLine1} <br className="hidden sm:block" />
                {t.hero.titleLine2}
              </h1>
              <p className={`text-xl sm:text-2xl text-char/85 font-medium ${isRTL ? 'font-serif' : 'font-arabic'}`}>
                {t.hero.subtitleAr}
              </p>
            </div>

            {/* Body Copy */}
            <p className="text-base sm:text-lg text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {t.hero.description}
            </p>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/shop" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto shadow-md">
                  <Icon name="bag" size={20} />
                  <span>{t.hero.shopCta}</span>
                </Button>
              </Link>
              <Link href="/about" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto border-maroon/20 text-maroon hover:bg-maroon/5">
                  <span>{t.hero.storyCta}</span>
                  <Icon name={isRTL ? 'chevron-left' : 'arrow-right'} size={18} />
                </Button>
              </Link>
            </div>

            {/* Micro Specs Bar */}
            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-muted font-medium border-t border-line/80">
              <div className="flex items-center gap-1.5">
                <Icon name="leaf" size={16} className="text-sage" />
                <span>{t.hero.specAcidFree}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="truck" size={16} className="text-kraft" />
                <span>{t.hero.specDelivery}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="card" size={16} className="text-terra" />
                <span>{t.hero.specCod}</span>
              </div>
            </div>

          </div>

          {/* Right Column — Editorial Product Frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer decorative ring */}
              <div className="absolute -inset-2 rounded-4xl bg-gradient-to-tr from-kraft/30 to-maroon/10 blur-xl opacity-70" />

              {/* Main image container */}
              <div className="relative aspect-3/4 rounded-3xl overflow-hidden border border-line shadow-2xl bg-white group">
                <Image
                  src="/lifestyle/hero-brand.jpg"
                  alt="Waraqa handmade sketchbook with linen and graphite pencils"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                />
                
                {/* Subtle bottom gradient & overlay badge */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 via-transparent to-transparent p-5 flex items-end justify-between">
                  <div className="text-white backdrop-blur-md bg-maroon/80 border border-white/20 px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-terra animate-pulse" />
                    <span>250 GSM · Kraft Series</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
