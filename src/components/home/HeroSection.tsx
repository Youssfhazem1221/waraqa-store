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
    <section className="relative w-full py-12 sm:py-16 lg:py-20 flex items-center justify-center overflow-hidden bg-[#201513]">
      {/* Full-bleed background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/lifestyle/hero-bg.jpg"
          alt="Waraqa sketchbook workspace flat lay"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-[1.02] transition-transform duration-1000"
        />
        {/* Light readability scrim — keeps the photo bright while anchoring
            the text zone. Bottom-weighted so the top of the image stays vivid;
            a soft radial adds just enough contrast behind the centered copy. */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#201513]/80 via-[#201513]/25 to-transparent" />
        <div className="absolute inset-0 bg-radial from-[#201513]/30 via-transparent to-transparent" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          className="space-y-4 sm:space-y-6"
          style={{ textShadow: '0 1px 12px rgba(20,12,10,0.65), 0 1px 3px rgba(20,12,10,0.7)' }}
        >

          {/* Headline Group */}
          <div className="space-y-2">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-cream leading-[1.08] drop-shadow-md">
              {t.hero.titleLine1} <br className="hidden sm:block" />
              {t.hero.titleLine2}
            </h1>
            <p className={`text-lg sm:text-2xl text-cream/90 font-medium ${isRTL ? 'font-serif' : 'font-arabic'}`}>
              {t.hero.subtitleAr}
            </p>
          </div>

          {/* Body Copy — translucent panel keeps the copy legible while the
              photo behind stays bright. */}
          <p className="text-sm sm:text-base text-cream max-w-xl mx-auto leading-relaxed font-normal bg-[#201513]/55 backdrop-blur-sm px-4 py-3">
            {t.hero.description}
          </p>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/shop" className="w-full sm:w-auto">
              <Button size="md" className="w-full sm:w-auto shadow-xl shadow-maroon/40 bg-maroon text-cream hover:bg-[#3b1a1c] border border-white/20 px-7 py-3 text-sm">
                <Icon name="bag" size={18} />
                <span>{t.hero.shopCta}</span>
              </Button>
            </Link>
            <Link href="/about" className="w-full sm:w-auto">
              <Button
                variant="ghost"
                size="md"
                className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/30 text-cream! font-medium hover:bg-white/20 hover:border-white/50 px-7 py-3 text-sm"
              >
                <span>{t.hero.storyCta}</span>
                <Icon name={isRTL ? 'chevron-left' : 'arrow-right'} size={16} />
              </Button>
            </Link>
          </div>

          {/* Micro Specs Bar */}
          <div className="pt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-cream/70 font-medium border-t border-white/15">
            <div className="flex items-center gap-1.5">
              <Icon name="leaf" size={15} className="text-sage" />
              <span>{t.hero.specAcidFree}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="truck" size={15} className="text-kraft" />
              <span>{t.hero.specDelivery}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="card" size={15} className="text-terra" />
              <span>{t.hero.specCod}</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
