'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import Icon from '@/components/ui/Icon';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
}

export default function MobileMenu({ isOpen, onClose, links }: MobileMenuProps) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { t, isRTL, lp } = useLanguage();

  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // The drawer was a plain div: Escape did nothing, the page kept scrolling
  // behind it, Tab walked off into the page underneath, and focus was left
  // wherever it happened to be. All four are fixed here.
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      // Restore what was there rather than assuming the page was scrollable.
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-esp/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.nav.allSketchbooks}
        className={`fixed inset-y-0 ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} w-4/5 max-w-xs bg-cream p-6 flex flex-col justify-between border-line z-10 animate-slideRight overflow-y-auto`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-line">
            <Logo variant="maroon" size="sm" />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="p-2 -me-2 text-char hover:text-maroon"
              aria-label="Close menu"
            >
              <Icon name="close" size={24} />
            </button>
          </div>

          {/* Language Switcher row */}
          <div className="pt-4 pb-2 flex items-center justify-between">
            <span className="text-sm text-muted">
              {isRTL ? 'اللغة' : 'Language'}
            </span>
            <LanguageToggle />
          </div>

          {/* Links */}
          <nav className="mt-4 flex flex-col">
            {links.map((link) => {
              const isActive =
                pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  aria-current={isActive ? 'page' : undefined}
                  className={`py-3.5 border-b border-line font-serif text-xl transition-colors ${
                    isActive ? 'text-maroon' : 'text-char hover:text-maroon'
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <Link
              href={lp('/cart')}
              onClick={onClose}
              className="py-3.5 border-b border-line font-serif text-xl text-char hover:text-maroon flex items-center justify-between"
            >
              <span>{t.nav.shoppingBag}</span>
              <span className="font-sans text-sm tabular-nums text-muted">({itemCount})</span>
            </Link>
          </nav>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-line text-xs text-muted">
          <p>{t.hero.subtitle}</p>
          <p className="mt-2">{t.hero.specDelivery} · {t.hero.specCod}</p>
        </div>
      </div>
    </div>
  );
}
