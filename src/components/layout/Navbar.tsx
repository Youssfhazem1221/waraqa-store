'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import Icon from '@/components/ui/Icon';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import MobileMenu from '@/components/layout/MobileMenu';
import GuideMenu from '@/components/layout/GuideMenu';
import { formatNumber } from '@/lib/format';

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount, isHydrated, openDrawer } = useCart();
  const { t, lp, locale } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Rebuilt only when the language changes, so MobileMenu is not handed a new
  // `links` array (and re-rendered) on every render.
  const navLinks = useMemo(
    () => [
      { href: lp('/'), label: t.nav.home },
      { href: lp('/shop'), label: t.nav.shop },
      { href: lp('/paper-guide'), label: t.nav.paperGuide },
      { href: lp('/blog'), label: t.nav.blog },
      { href: lp('/about'), label: t.nav.about },
    ],
    [t, lp]
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-cream/95 backdrop-blur-sm border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 grid grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ms-2 text-char cursor-pointer"
              aria-label={t.nav.openMenu}
            >
              <Icon name="menu" size={22} />
            </button>
            <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-sm">
              {navLinks.map((link) => {
                // The guide gets a dropdown on desktop; the mobile drawer keeps
                // it as a plain link.
                if (link.href === lp('/paper-guide')) return <GuideMenu key={link.href} />;
                const isActive =
                  pathname === link.href ||
                  (link.href !== lp('/') && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`py-2 underline-offset-[6px] decoration-1 transition-colors ${
                      isActive ? 'text-maroon underline' : 'text-char/75 hover:text-maroon'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <Logo variant="maroon" size="md" />

          <div className="flex items-center justify-end gap-5 text-char/80">
            {/* On phones too: it was only in the menu, two taps away. */}
            <LanguageToggle />
            <button
              type="button"
              onClick={openDrawer}
              className="relative inline-flex items-center gap-2 sm:gap-3 text-sm hover:text-maroon transition-colors min-h-11 cursor-pointer"
              aria-label={isHydrated ? `${t.nav.bag}, ${formatNumber(itemCount, locale)}` : t.nav.bag}
            >
              {/* The count sits on the icon's corner and only exists once there
                  is something in the bag. An empty bag used to show a bare ring
                  (in Readex Pro the Arabic «٠» is a dot, and a dot in a ring
                  did not read as zero), but the ring alone read as an unticked
                  option beside the bag. Nothing until the bag is read from
                  this browser: the server can't know it, and every page
                  flashed «0» before the real count. Being out of the flow, it
                  moves nothing when it appears. */}
              <span className="relative inline-flex">
                <Icon name="bag" size={20} />
                {isHydrated && itemCount > 0 && (
                  <span className="absolute -top-2 -end-2 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-maroon text-cream text-[11px] leading-none font-semibold tabular-nums ring-2 ring-cream">
                    {formatNumber(itemCount, locale)}
                  </span>
                )}
              </span>
              <span className="hidden sm:inline">{t.nav.bag}</span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        links={navLinks}
      />
    </>
  );
}
