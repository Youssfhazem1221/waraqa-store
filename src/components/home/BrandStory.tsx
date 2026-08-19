'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';

export default function BrandStory() {
  const { t } = useLanguage();

  return (
    <section className="py-16 sm:py-24 border-b border-line bg-[#FAF5EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Photo Gallery */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="relative aspect-4/5 rounded-3xl overflow-hidden border border-line shadow-sm">
              <Image
                src="/lifestyle/lifestyle-1.jpeg"
                alt="Waraqa sketchbook in hands"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center"
              />
            </div>
            <div className="relative aspect-4/5 rounded-3xl overflow-hidden border border-line shadow-sm mt-8">
              <Image
                src="/lifestyle/lifestyle-2.jpeg"
                alt="Artist holding open sketchbook"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-maroon">
              <span className="w-5 h-5 rounded-full border border-maroon flex items-center justify-center font-serif text-[11px]">
                01
              </span>
              <span>{t.story.badge}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-maroon leading-tight">
              {t.story.title}
            </h2>

            <div className="space-y-4 text-char/80 text-sm sm:text-base leading-relaxed">
              <p>{t.story.p1}</p>
              <p>{t.story.p2}</p>
            </div>

            <div className="pt-2">
              <Link href="/about">
                <Button variant="secondary">
                  <span>{t.story.learnMore}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
