'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { FREE_SHIP_OVER } from '@/lib/constants';

export default function CartSummary() {
  const { subtotal, shipping, total, items } = useCart();
  const { t } = useLanguage();

  const qualifiesForFreeShipping = subtotal >= FREE_SHIP_OVER;
  const remainingForFreeShipping = Math.max(0, FREE_SHIP_OVER - subtotal);

  return (
    <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs sticky top-24">
      <h2 className="font-serif text-xl sm:text-2xl font-semibold text-char">
        {t.cart.orderSummary}
      </h2>

      {/* Free shipping progress bar */}
      <div className="bg-cream/80 border border-line rounded-2xl p-4 space-y-2 text-xs">
        {qualifiesForFreeShipping ? (
          <div className="flex items-center gap-2 text-success font-semibold">
            <Icon name="check" size={16} />
            <span>{t.cart.qualifyFreeShip}</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-medium text-char">
              <span>{t.cart.progressPrefix}</span>
              <span className="text-maroon font-bold">
                {remainingForFreeShipping} {t.common.currency} {t.cart.toFreeShip}
              </span>
            </div>
            <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-maroon h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (subtotal / FREE_SHIP_OVER) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Line item amounts */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-char/80">
          <span>{t.cart.subtotal} ({items.reduce((s, i) => s + i.qty, 0)} {t.cart.items})</span>
          <span className="font-medium text-char">{subtotal} {t.common.currency}</span>
        </div>

        <div className="flex justify-between text-char/80">
          <span>{t.cart.estimatedShipping}</span>
          <span className="font-medium text-char">
            {shipping === 0 ? (
              <span className="text-success font-semibold">{t.common.freeShippingTag}</span>
            ) : (
              `${shipping} ${t.common.currency}`
            )}
          </span>
        </div>

        <div className="pt-3 border-t border-line flex justify-between items-baseline font-serif text-lg sm:text-xl font-bold text-maroon">
          <span>{t.cart.total}</span>
          <span>{total} <span className="text-xs font-sans font-normal text-muted">{t.common.currency}</span></span>
        </div>

        <p className="text-[11px] text-muted text-start leading-relaxed">
          {t.cart.taxNote}
        </p>
      </div>

      {/* Proceed to Checkout CTA */}
      <div className="space-y-3 pt-2">
        <Link href="/checkout" className="block">
          <Button size="lg" fullWidth className="shadow-md">
            <Icon name="lock" size={18} />
            <span>{t.cart.proceedCheckout}</span>
          </Button>
        </Link>

        <Link
          href="/shop"
          className="block text-center text-xs font-medium text-muted hover:text-maroon transition-colors py-1"
        >
          {t.cart.continueShopping}
        </Link>
      </div>

      {/* Trust reassurance */}
      <div className="pt-4 border-t border-line text-[11px] text-muted space-y-1.5">
        <div className="flex items-center gap-2">
          <Icon name="shield" size={14} className="text-sage" />
          <span>{t.cart.trustCod}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="mail" size={14} className="text-maroon" />
          <span>{t.cart.trustWa}</span>
        </div>
      </div>
    </div>
  );
}
