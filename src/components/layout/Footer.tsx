'use client';

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import Icon from '@/components/ui/Icon';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { useLanguage } from '@/context/LanguageContext';
import { WHATSAPP_NUMBER } from '@/lib/constants';

export default function Footer() {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="bg-esp text-cream/80 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Logo variant="dark" size="lg" showSubtitle />
            <p className="text-sm leading-relaxed text-cream/70 max-w-md pt-2">
              {t.story.p1}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-cream text-maroon hover:bg-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-transform hover:scale-105 shadow-xs"
              >
                <Icon name="whatsapp" size={16} />
                <span>WhatsApp: +{WHATSAPP_NUMBER}</span>
              </a>

              <LanguageToggle className="bg-white/10 border-white/15 text-cream" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-serif text-white font-semibold text-base tracking-wide">
              {t.footer.navigation}
            </h3>
            <ul className="text-sm -my-1">
              <li>
                <Link href="/" className="inline-block py-2.5 hover:text-cream transition-colors">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link href="/shop" className="inline-block py-2.5 hover:text-cream transition-colors">
                  {t.nav.allSketchbooks || t.nav.shop}
                </Link>
              </li>
              <li>
                <Link href="/about" className="inline-block py-2.5 hover:text-cream transition-colors">
                  {t.nav.ourStory}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="inline-block py-2.5 hover:text-cream transition-colors">
                  {t.nav.shoppingBag}
                </Link>
              </li>
            </ul>
          </div>

          {/* Service & Guarantee */}
          <div className="space-y-4">
            <h3 className="font-serif text-white font-semibold text-base tracking-wide">
              {t.footer.customerCare}
            </h3>
            <ul className="space-y-2.5 text-sm text-cream/70">
              <li className="flex items-start gap-2">
                <Icon name="truck" size={18} className="text-sage mt-0.5 shrink-0" />
                <span>{t.footer.deliveriesInfo}</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="card" size={18} className="text-kraft mt-0.5 shrink-0" />
                <span>{t.footer.codInfo}</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="shield" size={18} className="text-sage mt-0.5 shrink-0" />
                <span>{t.footer.inspectedInfo}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 mt-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/60">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} {isRTL ? `${t.common.brandNameAr} (${t.common.brandName})` : t.common.brandName}. {t.footer.rights}</span>
          </div>
          <div className="flex items-center gap-6">
            <span>{t.footer.madeWith}</span>
            <span className="text-[11px] font-mono opacity-50">{t.footer.version}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
