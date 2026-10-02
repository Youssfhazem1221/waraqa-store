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

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { t, lp } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Rebuilt only when the language changes, so MobileMenu is not handed a new
  // `links` array (and re-rendered) on every render.
  const navLinks = useMemo(
    () => [
      { href: lp('/'), label: t.nav.home },
      { href: lp('/shop'), label: t.nav.shop },
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
              aria-label="Open navigation menu"
            >
              <Icon name="menu" size={22} />
            </button>
            <nav className="hidden md:flex items-center gap-7 text-sm">
              {navLinks.map((link) => {
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
            <LanguageToggle className="hidden sm:inline-flex" />
            <Link
              href={lp('/cart')}
              className="inline-flex items-center gap-1.5 text-sm hover:text-maroon transition-colors py-2"
              aria-label={`${t.nav.bag} with ${itemCount} items`}
            >
              <Icon name="bag" size={19} />
              <span className="hidden sm:inline">{t.nav.bag}</span>
              <span className="tabular-nums">({itemCount})</span>
            </Link>
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
