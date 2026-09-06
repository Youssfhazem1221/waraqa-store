'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { revalidateCart } from '@/lib/api';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import EmptyCart from '@/components/cart/EmptyCart';
import Icon from '@/components/ui/Icon';
import { formatAmount } from '@/lib/money';

export default function CartPage() {
  const { items, isHydrated, clearCart, replaceItems } = useCart();
  const { t, isRTL, lp } = useLanguage();

  const [notices, setNotices] = useState<string[]>([]);
  const checked = useRef(false);

  // Cart lines are localStorage snapshots: the price and stock in them are
  // whatever they were when the item was added. Re-check them against the live
  // catalog once the bag is opened, so a sold-out book or a price change is
  // surfaced here instead of failing at the payment step.
  useEffect(() => {
    if (!isHydrated || checked.current || items.length === 0) return;
    checked.current = true;

    let active = true;
    revalidateCart(items)
      .then((res) => {
        if (!active) return;

        const messages: string[] = [];
        for (const item of res.removed) {
          messages.push(`${item.product.name} — ${t.cart.removedSoldOut}`);
        }
        for (const { item, oldPrice } of res.repriced) {
          messages.push(
            `${item.product.name} — ${t.cart.priceChanged} ${formatAmount(oldPrice)} → ${formatAmount(item.product.price)} ${t.common.currency}`
          );
        }
        for (const { item } of res.reduced) {
          messages.push(`${item.product.name} — ${t.cart.qtyReduced}`);
        }

        // Only touch cart state when something actually changed, so this never
        // causes a needless re-render of the whole bag.
        if (res.removed.length || res.repriced.length || res.reduced.length) {
          replaceItems(res.items);
          setNotices(messages);
        }
      })
      .catch(() => {
        // A failed check must not block the bag — the order endpoint re-prices
        // and re-checks stock server-side before anything is committed.
      });

    return () => {
      active = false;
    };
  }, [isHydrated, items, replaceItems, t]);

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

      {/* What changed since these items were added */}
      {notices.length > 0 && (
        <div
          role="status"
          className="mb-8 bg-warning/10 border border-warning/30 rounded-2xl p-4 sm:p-5 space-y-2"
        >
          <div className="flex items-center gap-2 font-semibold text-sm text-char">
            <Icon name="box" size={16} className="text-warning" />
            <span>{t.cart.updatedTitle}</span>
          </div>
          <ul className="text-xs text-muted space-y-1 ps-6 list-disc">
            {notices.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}

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
              href={lp('/shop')}
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
