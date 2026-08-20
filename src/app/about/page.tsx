'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { useLanguage } from '@/context/LanguageContext';

export default function AboutPage() {
  const { t, isRTL } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16 sm:space-y-24">
      {/* Intro Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-maroon">
          {t.about.badge}
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-maroon">
          {t.about.title}
        </h1>
        <p className={`text-xl sm:text-2xl text-char/80 pt-1 ${isRTL ? 'font-serif font-arabic' : 'font-sans'}`}>
          {t.about.subtitle}
        </p>
      </div>

      {/* Hero Image */}
      <div className="relative aspect-16/9 rounded-3xl overflow-hidden border-2 border-kraft shadow-lg bg-white">
        <Image
          src="/lifestyle/lifestyle-3.jpeg"
          alt="Hands sketching on Waraqa notebook"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 80vw"
          className="object-cover object-center"
        />
      </div>

      {/* Story Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="bg-white border border-line rounded-3xl p-8 space-y-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-cream border border-line flex items-center justify-center font-serif text-maroon font-bold text-base">
            {t.about.sec1Num}
          </div>
          <h2 className="font-serif text-2xl font-semibold text-char">
            {t.about.sec1Title}
          </h2>
          <p className="text-muted text-sm sm:text-base leading-relaxed">
            {t.story.p1}
          </p>
        </div>

        <div className="bg-white border border-line rounded-3xl p-8 space-y-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-cream border border-line flex items-center justify-center font-serif text-maroon font-bold text-base">
            {t.about.sec2Num}
          </div>
          <h2 className="font-serif text-2xl font-semibold text-char">
            {t.about.sec2Title}
          </h2>
          <div className="space-y-3 text-muted text-sm sm:text-base leading-relaxed">
            <p>
              <strong className="text-char">{t.about.voice1Title}</strong> {t.about.voice1Desc}
            </p>
            <p>
              <strong className="text-char">{t.about.voice2Title}</strong> {t.about.voice2Desc}
            </p>
          </div>
        </div>
      </div>

      {/* Brand Values Row */}
      <div className="bg-[#FAF5EE] border border-line rounded-3xl p-8 sm:p-12 text-center space-y-8">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-char">
          {t.about.principlesTitle}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white border border-line flex items-center justify-center mx-auto text-maroon">
              <Icon name="leaf" size={24} />
            </div>
            <div className="font-semibold text-char text-sm">{t.about.pNatural}</div>
            <div className="text-xs text-muted">{t.about.pNaturalDesc}</div>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white border border-line flex items-center justify-center mx-auto text-maroon">
              <Icon name="box" size={24} />
            </div>
            <div className="font-semibold text-char text-sm">{t.about.pTactile}</div>
            <div className="text-xs text-muted">{t.about.pTactileDesc}</div>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white border border-line flex items-center justify-center mx-auto text-maroon">
              <Icon name="heart" size={24} />
            </div>
            <div className="font-semibold text-char text-sm">{t.about.pUnhurried}</div>
            <div className="text-xs text-muted">{t.about.pUnhurriedDesc}</div>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white border border-line flex items-center justify-center mx-auto text-maroon">
              <Icon name="shield" size={24} />
            </div>
            <div className="font-semibold text-char text-sm">{t.about.pHonest}</div>
            <div className="text-xs text-muted">{t.about.pHonestDesc}</div>
          </div>
        </div>

        <div className="pt-4">
          <Link href="/shop">
            <Button size="lg">
              <Icon name="bag" size={20} />
              <span>{t.about.exploreBtn}</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
