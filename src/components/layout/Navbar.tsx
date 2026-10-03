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

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount, openDrawer } = useCart();
  const { t, lp } = useLanguage();
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
              aria-label="Open navigation menu"
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
            <LanguageToggle className="hidden sm:inline-flex" />
            <button
              type="button"
              onClick={openDrawer}
              className="relative inline-flex items-center gap-2 text-sm hover:text-maroon transition-colors py-2 cursor-pointer"
              aria-label={`${t.nav.bag}, ${itemCount}`}
            >
              <Icon name="bag" size={20} />
              <span className="hidden sm:inline">{t.nav.bag}</span>
              {/* Filled once there is something in it, so a full bag is never
                  mistaken for an empty one. */}
              <span
                className={`min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                  itemCount > 0 ? 'bg-maroon text-cream' : 'border border-char/30 text-char/70'
                }`}
              >
                {itemCount}
              </span>
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
