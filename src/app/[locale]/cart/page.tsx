'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCartRevalidation } from '@/lib/useCartRevalidation';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import CartNotices from '@/components/cart/CartNotices';
import EmptyCart from '@/components/cart/EmptyCart';
import BagSkeleton from '@/components/cart/BagSkeleton';
import StickyBagBar from '@/components/cart/StickyBagBar';
import Icon from '@/components/ui/Icon';

export default function CartPage() {
  const { items, isHydrated, clearCart, total, shippingQuote } = useCart();
  const { t, isRTL, lp } = useLanguage();
  const checkoutRef = useRef<HTMLDivElement>(null);

  // A sold-out book or a price change is surfaced here instead of failing at
  // the payment step.
  const notices = useCartRevalidation();

  // The bag lives in this browser, so the server can only send the frame.
  // Header, container and height are the same before and after it is read
  // (and when it is empty), so nothing on the first screen moves.
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 min-h-screen">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-line">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm text-muted">
            {t.cart.reviewBag}
          </span>
          {isHydrated && items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-muted hover:text-error transition-colors flex items-center gap-1.5 min-h-6 -my-1 cursor-pointer"
            >
              <Icon name="close" size={14} />
              <span>{t.cart.clearBag}</span>
            </button>
          )}
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-char mt-1 text-balance">
          {t.cart.shoppingBag}
        </h1>
      </div>

      {/* What changed since these items were added. The check may also have
          emptied the bag; say why rather than just "empty". */}
      <CartNotices notices={notices} />

      {!isHydrated ? (
        <BagSkeleton variant="bag" />
      ) : items.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left: Items List (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-line rounded-3xl p-6 sm:p-8 shadow-xs">
              {/* The list draws the rules between lines and the footer's rule
                  closes it. Each line also drew its own, so two rules sat 32px
                  apart under the last one. */}
              <div className="divide-y divide-line">
                {items.map((item) => (
                  <CartItem key={item.product.sku} item={item} />
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-line flex items-center justify-between text-xs text-muted">
                <Link
                  href={lp('/shop')}
                  className="inline-flex items-center gap-1.5 min-h-11 -my-3.5 font-medium text-maroon hover:underline"
                >
                  <Icon name={isRTL ? 'chevron-right' : 'chevron-left'} size={14} />
                  <span>{t.cart.continueBrowsing}</span>
                </Link>
              </div>
            </div>

            {/* Right: Order Summary (5 cols) */}
            <div className="lg:col-span-5">
              <CartSummary ctaRef={checkoutRef} />
            </div>
          </div>

          <StickyBagBar
            watch={checkoutRef}
            label={shippingQuote.exact ? t.cart.total : t.checkout.totalFrom}
            total={total}
            action={t.cart.proceedCheckout}
            icon="lock"
            href={lp('/checkout')}
          />
        </>
      )}
    </div>
  );
}
