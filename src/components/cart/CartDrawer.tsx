'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { buttonClasses } from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import QuantityStepper from '@/components/product/QuantityStepper';
import { formatAmount, lineTotal } from '@/lib/money';
import { shortName } from '@/lib/api';
import { FREE_SHIP_OVER } from '@/lib/constants';

/**
 * Slide-in bag. Opens on every add so the shopper sees the item land, what is
 * already in the bag, and the way to checkout — without leaving the page.
 */
export default function CartDrawer() {
  const { items, subtotal, itemCount, drawerOpen, closeDrawer, lastAddedSku, updateQty, removeItem } = useCart();
  const { t, isRTL, lp } = useLanguage();
  const pathname = usePathname();

  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Navigating (e.g. to checkout from the panel) closes it.
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      closeDrawer();
    }
  }, [pathname, closeDrawer]);

  // Same dialog behaviour as the mobile menu: Escape closes, focus is trapped
  // inside and restored afterwards, and the page behind does not scroll.
  useEffect(() => {
    if (!drawerOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDrawer();
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
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [drawerOpen, closeDrawer]);

  // Just-added line first, so it is the first thing the eye lands on.
  const ordered = [...items].sort(
    (a, b) => Number(b.product.sku === lastAddedSku) - Number(a.product.sku === lastAddedSku)
  );
  const justAdded = Boolean(lastAddedSku && items.some((i) => i.product.sku === lastAddedSku));
  const toFree = Math.max(0, FREE_SHIP_OVER - subtotal);
  const progress = Math.min(100, Math.round((subtotal / FREE_SHIP_OVER) * 100));

  return (
    <div
      className={`fixed inset-0 z-50 ${drawerOpen ? '' : 'pointer-events-none'}`}
      // Closed, the panel stays mounted for its slide animation; inert keeps it
      // out of the tab order and the accessibility tree.
      inert={!drawerOpen}
    >
      <div
        className={`absolute inset-0 bg-esp/40 transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeDrawer}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.cart.drawerTitle}
        className={`absolute inset-y-0 end-0 w-full sm:max-w-md bg-cream flex flex-col transition-transform duration-300 ease-out ${
          drawerOpen ? 'translate-x-0' : isRTL ? '-translate-x-full' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between px-5 h-16 border-b border-line shrink-0">
          <p className="flex items-center gap-2 font-medium text-char" aria-live="polite">
            {justAdded ? (
              <>
                <span className="w-6 h-6 rounded-full bg-success text-cream inline-flex items-center justify-center">
                  <Icon name="check" size={14} />
                </span>
                {t.cart.drawerAdded}
              </>
            ) : (
              <>
                {t.cart.drawerTitle} <span className="text-muted tabular-nums">({itemCount})</span>
              </>
            )}
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={closeDrawer}
            className="p-2 -me-2 text-char hover:text-maroon cursor-pointer"
            aria-label={t.cart.closeBag}
          >
            <Icon name="close" size={22} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <p className="font-serif text-2xl text-char">{t.cart.emptyTitle}</p>
            <Link href={lp('/shop')} className={buttonClasses({ className: 'mt-6' })}>
              {t.cart.exploreBtn}
            </Link>
          </div>
        ) : (
          <>
            <div className="px-5 py-4 border-b border-line shrink-0">
              <p className="text-sm text-char">
                {toFree > 0 ? (
                  <>
                    <span className="font-semibold tabular-nums">
                      {formatAmount(toFree)} {t.common.currency}
                    </span>{' '}
                    {t.cart.toFreeShip}
                  </>
                ) : (
                  t.cart.qualifyFreeShip
                )}
              </p>
              <div className="mt-2 h-1 bg-line">
                <div className="h-full bg-maroon transition-[width] duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ul className="flex-1 overflow-y-auto px-5">
              {ordered.map(({ product, qty }) => {
                const highlighted = product.sku === lastAddedSku;
                const name = shortName(isRTL ? product.nameAr || product.name : product.name);
                return (
                  <li
                    key={product.sku}
                    className={`flex gap-4 py-4 border-b border-line ${highlighted ? 'bg-maroon/[0.04] -mx-5 px-5' : ''}`}
                  >
                    <Link
                      href={lp(`/product/${product.slug}`)}
                      className="relative w-16 h-20 shrink-0 overflow-hidden"
                    >
                      <Image src={product.image} alt={name} fill sizes="64px" className="object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-3">
                        <p className="font-medium text-char leading-snug">{name}</p>
                        <p className="tabular-nums text-char shrink-0">
                          {formatAmount(lineTotal(product.price, qty))}
                        </p>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        {product.size} · {product.gsm}
                        {isRTL ? ' جرام' : 'gsm'}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <QuantityStepper
                          qty={qty}
                          min={1}
                          max={Math.max(1, Math.min(99, product.stock))}
                          onChange={(n) => updateQty(product.sku, n)}
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(product.sku)}
                          className="text-xs text-muted underline underline-offset-4 hover:text-char cursor-pointer"
                        >
                          {t.cart.remove}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="px-5 pt-4 pb-5 border-t border-line shrink-0 bg-cream">
              <div className="flex items-baseline justify-between">
                <span className="text-char">{t.cart.subtotal}</span>
                <span className="text-xl font-semibold tabular-nums">
                  {formatAmount(subtotal)} <span className="text-sm font-normal text-muted">{t.common.currency}</span>
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">{t.cart.taxNote}</p>
              <Link
                href={lp('/checkout')}
                className={buttonClasses({ size: 'lg', fullWidth: true, className: 'mt-4' })}
              >
                {t.cart.proceedCheckout}
              </Link>
              <div className="mt-3 flex items-center justify-between text-sm">
                <Link
                  href={lp('/cart')}
                  className="text-maroon underline underline-offset-4"
                >
                  {t.cart.viewBag}
                </Link>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="text-muted hover:text-char cursor-pointer"
                >
                  {t.cart.continueShopping}
                </button>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
