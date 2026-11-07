'use client';

import React from 'react';
import Link from 'next/link';
import { buttonClasses } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';
import { WHATSAPP_NUMBER } from '@/lib/constants';
import { factSeparator, formatNumber } from '@/lib/format';

const linkClass = 'inline-flex items-center min-h-11 underline underline-offset-4';

export default function NotFoundClient() {
  const { t, lp, locale } = useLanguage();
  return (
    <div className="max-w-md mx-auto my-24 px-4 text-center">
      <p className="text-sm text-muted">
        {formatNumber(404, locale)}
        {factSeparator(locale)}
        {t.notFound.eyebrow}
      </p>
      <h1 className="mt-3 font-serif text-4xl font-semibold text-char">{t.notFound.title}</h1>
      <p className="mt-3 text-muted">{t.notFound.desc}</p>
      {/* The same ways on as the home page: the shop, the paper guide, and
          someone to ask. */}
      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-x-6 gap-y-2">
        <Link href={lp('/shop')} className={buttonClasses()}>
          {t.notFound.shop}
        </Link>
        <Link href={lp('/paper-guide')} className={`${linkClass} text-maroon`}>
          {t.notFound.guide}
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-x-6 text-sm text-muted">
        <Link href={lp('/')} className={`${linkClass} hover:text-maroon`}>
          {t.notFound.home}
        </Link>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkClass} hover:text-maroon`}
        >
          {t.notFound.whatsapp}
        </a>
      </div>
    </div>
  );
}
