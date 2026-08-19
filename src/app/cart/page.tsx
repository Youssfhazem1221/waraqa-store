'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import EmptyCart from '@/components/cart/EmptyCart';
import Icon from '@/components/ui/Icon';

export default function CartPage() {
  const { items, isHydrated, clearCart } = useCart();
  const { t, isRTL } = useLanguage();

  if (!isHydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="animate-pulse font-serif text-lg text-muted">{t.common.loading}</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-8 pb-6 border-b border-line">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-maroon">
            {t.cart.reviewBag}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-char mt-1">
            {t.cart.shoppingBag}
          </h1>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-muted hover:text-error transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Icon name="close" size={14} />
          <span>{t.cart.clearBag}</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left: Items List (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-line rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="divide-y divide-line">
            {items.map((item) => (
              <CartItem key={item.product.sku} item={item} />
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-line flex items-center justify-between text-xs text-muted">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 font-medium text-maroon hover:underline"
            >
              <Icon name={isRTL ? 'chevron-right' : 'chevron-left'} size={14} />
              <span>{t.cart.continueBrowsing}</span>
            </Link>
          </div>
        </div>

        {/* Right: Order Summary (5 cols) */}
        <div className="lg:col-span-5">
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
