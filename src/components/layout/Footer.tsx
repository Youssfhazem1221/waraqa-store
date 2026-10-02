'use client';

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { useLanguage } from '@/context/LanguageContext';
import { WHATSAPP_NUMBER, INSTAGRAM_URL } from '@/lib/constants';

export default function Footer() {
  const { t, lp } = useLanguage();

  const linkClass = 'hover:text-cream underline-offset-4 hover:underline';

  return (
    <footer className="bg-esp text-cream/70 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10">
          <div className="col-span-2 md:col-span-6 space-y-4">
            <Logo variant="dark" size="lg" />
            <p className="text-sm leading-relaxed max-w-sm">{t.hero.subtitle}</p>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-cream font-medium mb-3">{t.footer.navigation}</h3>
            <ul className="text-sm space-y-2">
              <li><Link href={lp('/shop')} className={linkClass}>{t.nav.allSketchbooks}</Link></li>
              <li><Link href={lp('/about')} className={linkClass}>{t.nav.ourStory}</Link></li>
              <li><Link href={lp('/cart')} className={linkClass}>{t.nav.shoppingBag}</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-cream font-medium mb-3">{t.footer.customerCare}</h3>
            <ul className="text-sm space-y-2">
              <li>{t.footer.deliveriesInfo}</li>
              <li>{t.footer.codInfo}</li>
              <li>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  WhatsApp
                </a>
                {' · '}
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-cream/10 flex flex-wrap items-center justify-between gap-4 text-xs text-cream/50">
          <span>
            © {new Date().getFullYear()} {t.common.brandName} ({t.common.brandNameAr}) · {t.footer.madeWith}
          </span>
          <LanguageToggle className="text-cream text-xs" />
        </div>
      </div>
    </footer>
  );
}
