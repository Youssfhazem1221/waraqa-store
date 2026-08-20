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
    <section className="relative w-full min-h-[90vh] sm:min-h-[94vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-[#201513]">
      {/* Full-bleed background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/lifestyle/hero-fullbleed.jpg"
          alt="Waraqa artist studio workspace with open handmade sketchbook"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-[1.02] transition-transform duration-1000"
        />
        {/* Layered cinematic gradient overlays for crystal-clear text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#201513] via-[#201513]/70 to-[#201513]/40" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#201513]/40 to-[#201513]/80" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28 lg:py-32 flex flex-col items-center text-center">
        <div className="max-w-3xl space-y-6 sm:space-y-8">
          
          {/* Brand Kicker Badge */}
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest text-cream shadow-lg">
            <div className="w-5 h-5 relative flex-shrink-0">
              <Image
                src="/logos/waraqa-1x1-dark-cream.svg"
                alt="Waraqa symbol"
                fill
                className="object-contain"
              />
            </div>
            <span>{t.hero.badge}</span>
          </div>

          {/* Headline Group */}
          <div className="space-y-3">
            <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-cream leading-[1.05] drop-shadow-md">
              {t.hero.titleLine1} <br />
              {t.hero.titleLine2}
            </h1>
            <p className={`text-xl sm:text-3xl text-cream/90 font-medium pt-1 ${isRTL ? 'font-serif' : 'font-arabic'}`}>
              {t.hero.subtitleAr}
            </p>
          </div>

          {/* Body Copy */}
          <p className="text-base sm:text-xl text-cream/80 max-w-2xl mx-auto leading-relaxed font-normal">
            {t.hero.description}
          </p>

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/shop" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto shadow-xl shadow-maroon/40 bg-maroon text-cream hover:bg-[#3b1a1c] border border-white/20 px-8 py-4 text-base">
                <Icon name="bag" size={20} />
                <span>{t.hero.shopCta}</span>
              </Button>
            </Link>
            <Link href="/about" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto bg-white/10 backdrop-blur-md border-white/30 text-cream hover:bg-white/20 hover:border-white/50 px-8 py-4 text-base"
              >
                <span>{t.hero.storyCta}</span>
                <Icon name={isRTL ? 'chevron-left' : 'arrow-right'} size={18} />
              </Button>
            </Link>
          </div>

          {/* Micro Specs Bar */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm text-cream/70 font-medium border-t border-white/15">
            <div className="flex items-center gap-2">
              <Icon name="leaf" size={16} className="text-sage" />
              <span>{t.hero.specAcidFree}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="truck" size={16} className="text-kraft" />
              <span>{t.hero.specDelivery}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="card" size={16} className="text-terra" />
              <span>{t.hero.specCod}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-2 animate-bounce">
        <div className="w-5 h-8 rounded-full border-2 border-cream/40 flex items-start justify-center pt-1.5 backdrop-blur-xs">
          <div className="w-1.5 h-2.5 rounded-full bg-cream/80" />
        </div>
      </div>
    </section>
  );
}
