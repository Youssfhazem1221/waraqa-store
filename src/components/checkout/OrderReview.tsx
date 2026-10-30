'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Price from '@/components/ui/Price';
import { withIdentifiers } from '@/components/ui/Identifiers';
import { lineTotal } from '@/lib/money';
import { formatNumber, plural } from '@/lib/format';

interface OrderReviewProps {
  isSubmitting: boolean;
  errorMessage?: string;
  /** Chosen delivery governorate. The fee depends on it, so until one is
   *  picked this panel shows a range rather than a number. */
  governorate?: string;
  /** Wraps the Place order button, so the phone bar can step aside while it is on screen. */
  ctaRef?: React.Ref<HTMLDivElement>;
}

/** The order and its Place order button: the submit button of the checkout form it sits in. */
export default function OrderReview({
  isSubmitting,
  errorMessage,
  governorate,
  ctaRef,
}: OrderReviewProps) {
  const { items, subtotal, itemCount, quoteFor } = useCart();
  const { t, isRTL, lp, locale } = useLanguage();

  const quote = quoteFor(governorate);
  const shipping = quote.amount;
  const total = subtotal + shipping;

  // On a phone the order can be placed from the bar at the bottom of the
  // screen, far from this panel; a refusal must not land out of sight.
  const alertRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = alertRef.current;
    if (!errorMessage || !el) return;
    const { top, bottom } = el.getBoundingClientRect();
    if (top < 64 || bottom > window.innerHeight) el.scrollIntoView({ block: 'center' });
  }, [errorMessage]);

  return (
    <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs sticky top-24">
      <div className="flex items-center justify-between pb-4 border-b border-line">
        <h2 className="font-serif text-xl font-semibold text-char">
          {t.checkout.orderReview}
        </h2>
        <span className="text-xs text-muted font-medium">
          {plural(locale, itemCount, t.cart.itemCount)}
        </span>
      </div>

      {/* Mini items list */}
      <div className="max-h-60 overflow-y-auto divide-y divide-line pe-1">
        {items.map((item) => {
          const displayName = isRTL ? (item.product.nameAr || item.product.name) : item.product.name;

          return (
            <div key={item.product.sku} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-cream border border-line shrink-0">
                  <Image
                    src={item.product.image}
                    alt={displayName}
                    fill
                    sizes="48px"
                    className="object-cover object-center"
                  />
                </div>
                <div className="min-w-0">
                  {/* Two lines with room under them: a one-line truncate box
                      clipped the dots off a final ي («مينى»). */}
                  <div className="font-semibold text-char line-clamp-2 leading-relaxed">{displayName}</div>
                  <div className="text-muted">
                    {formatNumber(item.qty, locale)} × <Price value={item.product.price} locale={locale} />
                  </div>
                </div>
              </div>
              <Price
                value={lineTotal(item.product.price, item.qty)}
                locale={locale}
                className="font-semibold text-char shrink-0"
              />
            </div>
          );
        })}
      </div>

      {/* Calculation */}
      <div className="pt-4 border-t border-line space-y-2.5 text-xs sm:text-sm">
        <div className="flex justify-between text-char/80">
          <span>{t.cart.subtotal}</span>
          <Price value={subtotal} locale={locale} className="font-medium text-char" />
        </div>

        <div className="flex justify-between text-char/80">
          <span>{t.checkout.deliveryFee}</span>
          <span className="font-medium text-char">
            {!quote.exact ? (
              <Price value={quote.low} to={quote.high} locale={locale} className="text-muted" />
            ) : quote.free ? (
              <span className="text-success font-bold">{t.common.freeShippingTag}</span>
            ) : (
              <Price value={shipping} locale={locale} />
            )}
          </span>
        </div>

        {!quote.exact && (
          <p className="text-xs text-muted leading-relaxed">
            {t.checkout.pickGovernorateForFee}
          </p>
        )}

        <div className="pt-3 border-t border-line flex justify-between items-baseline text-xl font-bold text-maroon">
          <span>{quote.exact ? t.checkout.totalDue : t.checkout.totalFrom}</span>
          <Price value={total} locale={locale} currencyClassName="text-xs font-normal text-muted" />
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div ref={alertRef} role="alert" className="bg-error/10 border border-error/20 rounded-xl p-3 text-sm text-error">
          {withIdentifiers(errorMessage)}
        </div>
      )}

      {/* Big Confirm & Buy Button */}
      <div ref={ctaRef} className="space-y-3 pt-2">
        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          className="shadow-md text-base"
        >
          <Icon name="check" size={20} />
          <span>{t.checkout.confirmAndBuy}</span>
        </Button>

        <p className="text-xs text-muted text-center leading-relaxed">
          {t.checkout.disclaimer}
        </p>
        <p className="text-xs text-muted text-center leading-relaxed">
          {t.legal.agreePrefix}{' '}
          <Link href={lp('/terms')} target="_blank" className="underline underline-offset-2 hover:text-char">
            {t.footer.termsLink}
          </Link>
          {t.legal.listSep}
          <Link href={lp('/returns')} target="_blank" className="underline underline-offset-2 hover:text-char">
            {t.footer.returnsLink}
          </Link>
          {t.legal.and}
          <Link href={lp('/privacy')} target="_blank" className="underline underline-offset-2 hover:text-char">
            {t.footer.privacyLink}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
