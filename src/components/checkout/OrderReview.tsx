'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';

interface OrderReviewProps {
  onConfirm: () => void;
  isSubmitting: boolean;
  errorMessage?: string;
}

export default function OrderReview({
  onConfirm,
  isSubmitting,
  errorMessage,
}: OrderReviewProps) {
  const { items, subtotal, shipping, total } = useCart();
  const { t, isRTL } = useLanguage();

  return (
    <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs sticky top-24">
      <div className="flex items-center justify-between pb-4 border-b border-line">
        <h2 className="font-serif text-xl font-semibold text-char">
          {t.checkout.orderReview}
        </h2>
        <span className="text-xs text-muted font-medium">
          {items.reduce((s, i) => s + i.qty, 0)} {t.cart.items}
        </span>
      </div>

      {/* Mini items list */}
      <div className="max-h-60 overflow-y-auto divide-y divide-line pr-1">
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
                  <div className="font-semibold text-char truncate">{displayName}</div>
                  <div className="text-muted">
                    {item.qty} × {item.product.price} {t.common.currency}
                  </div>
                </div>
              </div>
              <div className="font-semibold text-char shrink-0 font-mono">
                {item.product.price * item.qty} {t.common.currency}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calculation */}
      <div className="pt-4 border-t border-line space-y-2.5 text-xs sm:text-sm">
        <div className="flex justify-between text-char/80">
          <span>{t.cart.subtotal}</span>
          <span className="font-medium text-char">{subtotal} {t.common.currency}</span>
        </div>

        <div className="flex justify-between text-char/80">
          <span>{t.checkout.deliveryFee}</span>
          <span className="font-medium text-char">
            {shipping === 0 ? (
              <span className="text-success font-bold">{t.common.freeShippingTag}</span>
            ) : (
              `${shipping} ${t.common.currency}`
            )}
          </span>
        </div>

        <div className="pt-3 border-t border-line flex justify-between items-baseline font-serif text-xl font-bold text-maroon">
          <span>{t.checkout.totalDue}</span>
          <span>{total} <span className="text-xs font-sans font-normal text-muted">{t.common.currency}</span></span>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="bg-error/10 border border-error/20 rounded-xl p-3 text-xs text-error">
          {errorMessage}
        </div>
      )}

      {/* Big Confirm & Buy Button */}
      <div className="space-y-3 pt-2">
        <Button
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          onClick={onConfirm}
          className="shadow-md text-base"
        >
          <Icon name="check" size={20} />
          <span>{t.checkout.confirmAndBuy}</span>
        </Button>

        <p className="text-[11px] text-muted text-center leading-relaxed">
          {t.checkout.disclaimer}
        </p>
      </div>
    </div>
  );
}
