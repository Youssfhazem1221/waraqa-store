'use client';

import React from 'react';
import Link from 'next/link';
import { buttonClasses } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';

export default function NotFound() {
  const { t, lp } = useLanguage();
  return (
    <div className="max-w-md mx-auto my-24 px-4 text-center">
      <p className="text-sm text-muted">404 · {t.notFound.eyebrow}</p>
      <h1 className="mt-3 font-serif text-4xl font-semibold text-char">{t.notFound.title}</h1>
      <p className="mt-3 text-muted">{t.notFound.desc}</p>
      <div className="mt-8 flex justify-center items-center gap-6">
        <Link href={lp('/shop')} className={buttonClasses()}>
          {t.notFound.shop}
        </Link>
        <Link href={lp('/')} className="text-maroon underline underline-offset-4">
          {t.notFound.home}
        </Link>
      </div>
    </div>
  );
}
