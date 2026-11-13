'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { buttonClasses } from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Price from '@/components/ui/Price';
import FreeShipMeter from '@/components/cart/FreeShipMeter';
import { freeShipOver } from '@/lib/constants';
import { useRateText, useShippingZones } from '@/context/ShippingContext';
import { plural, RANGE_DASH } from '@/lib/format';

interface CartSummaryProps {
  /** Wraps the checkout button, so the phone bar can step aside while it is on screen. */
  ctaRef?: React.Ref<HTMLDivElement>;
}

export default function CartSummary({ ctaRef }: CartSummaryProps) {
  const { subtotal, shippingQuote, total, itemCount } = useCart();
  const { t, lp, locale } = useLanguage();
  const threshold = freeShipOver(useShippingZones());
  const rateText = useRateText();

  return (
    <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs sticky top-24">
      <h2 className="font-serif text-xl sm:text-2xl font-semibold text-char">
        {t.cart.orderSummary}
      </h2>

      {/* Free delivery: the same sentence and bar as the slide-in bag */}
      <div className="bg-cream/80 border border-line rounded-2xl p-4 space-y-2">
        <FreeShipMeter />
        {threshold > 0 && subtotal >= threshold && (
          <p className="text-xs text-muted leading-relaxed text-pretty">{rateText(t.cart.freeShipZoneNote)}</p>
        )}
      </div>

      {/* Line item amounts */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-char/80">
          <span>
            {t.cart.subtotal} ({plural(locale, itemCount, t.cart.itemCount)})
          </span>
          <Price value={subtotal} locale={locale} className="font-medium text-char" />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-char/80">
            <span>{t.cart.shippingFromLabel}</span>
            <span className="font-medium text-char">
              {shippingQuote.exact ? (
                shippingQuote.free ? (
                  <span className="text-success font-semibold">{t.common.freeShippingTag}</span>
                ) : (
                  <Price value={shippingQuote.amount} locale={locale} />
                )
              ) : shippingQuote.low === 0 ? (
                // Past the free threshold the cheap end is 0. "0–75" reads like
                // a glitch; name it.
                <span className="whitespace-nowrap">
                  <span className="text-success font-semibold">{t.common.freeShippingTag}</span>
                  {RANGE_DASH}
                  <Price value={shippingQuote.high} locale={locale} />
                </span>
              ) : (
                <Price value={shippingQuote.low} to={shippingQuote.high} locale={locale} />
              )}
            </span>
          </div>
          <p className="text-xs text-muted leading-relaxed text-pretty">
            {shippingQuote.low === 0
              ? rateText(t.cart.shippingEstimateNoteFree)
              : rateText(t.cart.shippingEstimateNote)}
          </p>
        </div>

        <div className="pt-3 border-t border-line flex justify-between items-baseline text-lg sm:text-xl font-bold text-maroon">
          <span>{shippingQuote.exact ? t.cart.total : t.checkout.totalFrom}</span>
          <Price value={total} locale={locale} currencyClassName="text-xs font-normal text-muted" />
        </div>

        <p className="text-xs text-muted text-start leading-relaxed text-pretty">
          {t.cart.taxNote}
        </p>
      </div>

      {/* Proceed to Checkout CTA */}
      <div ref={ctaRef} className="space-y-3 pt-2">
        <Link href={lp('/checkout')} className={buttonClasses({ size: 'lg', fullWidth: true })}>
          <Icon name="lock" size={18} />
          <span>{t.cart.proceedCheckout}</span>
        </Link>

        <Link
          href={lp('/shop')}
          className="block text-center text-xs font-medium text-muted hover:text-maroon transition-colors py-1"
        >
          {t.cart.continueShopping}
        </Link>
      </div>

      {/* Trust reassurance */}
      <div className="pt-4 border-t border-line text-xs text-muted space-y-1.5">
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
