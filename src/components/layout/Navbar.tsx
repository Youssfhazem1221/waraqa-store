'use client';

import React, { useState, useEffect } from 'react';
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
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/shop', label: t.nav.shop },
    { href: '/about', label: t.nav.about },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          scrolled
            ? 'bg-cream/95 backdrop-blur-md shadow-xs border-b border-line/80 py-3.5'
            : 'bg-cream border-b border-line py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Mobile Menu Button + Brand Logo (flex-1 on desktop to balance right actions) */}
          <div className="flex items-center gap-3 md:flex-1 md:justify-start">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-maroon hover:bg-maroon/5 rounded-xl transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Icon name="menu" size={24} />
            </button>

            {/* Brand Logo */}
            <Logo variant="maroon" size="md" showSubtitle />
          </div>

          {/* Center: Desktop Nav (centered between left and right) */}
          <nav className="hidden md:flex items-center justify-center gap-8 text-sm font-medium shrink-0">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors relative py-2.5 ${
                    isActive
                      ? 'text-maroon font-semibold'
                      : 'text-char/80 hover:text-maroon'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-2 left-0 w-full h-0.5 bg-maroon rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions: Language Toggle, Search (desktop only), Cart (flex-1 on desktop to balance left) */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 md:flex-1">
            <LanguageToggle className="hidden sm:inline-flex" />

            {/* Search hidden on mobile, visible on desktop */}
            <Link
              href="/shop"
              className="hidden md:inline-flex p-2 text-char/80 hover:text-maroon hover:bg-maroon/5 rounded-xl transition-colors"
              aria-label={t.nav.search}
              title={t.nav.search}
            >
              <Icon name="search" size={20} />
            </Link>

            <Link
              href="/cart"
              className="relative inline-flex items-center gap-2 bg-maroon text-cream px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl font-medium text-sm transition-transform hover:bg-esp active:scale-95 shadow-xs shadow-maroon/10"
              aria-label={`${t.nav.bag} with ${itemCount} items`}
            >
              <Icon name="bag" size={18} />
              <span className="hidden sm:inline">{t.nav.bag}</span>
              <span className="inline-flex items-center justify-center bg-cream text-maroon text-xs font-bold w-5 h-5 rounded-full">
                {itemCount}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        links={navLinks}
      />
    </>
  );
}
