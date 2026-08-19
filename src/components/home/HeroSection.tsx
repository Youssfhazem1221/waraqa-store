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
    <section className="relative overflow-hidden border-b border-line bg-[#FAF5EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Main Content (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 bg-white/90 border border-line px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-maroon shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-terra animate-pulse" />
              <span>{t.hero.badge}</span>
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-maroon leading-[1.08]">
                {t.hero.titleLine1} <br className="hidden sm:block" />
                {t.hero.titleLine2}
              </h1>
              <p className={`text-xl sm:text-2xl text-char/80 font-medium pt-1 ${isRTL ? 'font-serif' : 'font-arabic'}`}>
                {t.hero.subtitleAr}
              </p>
            </div>

            <p className="text-base sm:text-lg text-char/75 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t.hero.description}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/shop">
                <Button size="lg" className="w-full sm:w-auto shadow-md">
                  <Icon name="bag" size={20} />
                  <span>{t.hero.shopCta}</span>
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <span>{t.hero.storyCta}</span>
                  <Icon name={isRTL ? 'chevron-left' : 'arrow-right'} size={18} />
                </Button>
              </Link>
            </div>

            {/* Micro specs bar */}
            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-muted font-medium border-t border-line/70">
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

          {/* Right Hero Image (5 cols) - Clean, editorial, no AI badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative aspect-4/5 rounded-3xl overflow-hidden border border-line shadow-xl bg-white transition-transform duration-500 hover:scale-[1.01]">
                <Image
                  src="/lifestyle/hero.jpeg"
                  alt="Waraqa sketchbooks in artist studio"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
