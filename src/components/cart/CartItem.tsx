'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CartItem as CartItemType } from '@/types';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import Icon from '@/components/ui/Icon';
import QuantityStepper from '@/components/product/QuantityStepper';
import Price from '@/components/ui/Price';
import SpecLine from '@/components/ui/SpecLine';
import { lineTotal } from '@/lib/money';
import { formatNumber, sizeLabel } from '@/lib/format';
import { shortName } from '@/lib/api';
import { MAX_LINE_QTY } from '@/lib/constants';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQty, removeItem } = useCart();
  const { t, isRTL, lp, locale } = useLanguage();
  const { product, qty } = item;

  // Sheets and weight are listed on the line below, so the name drops them;
  // in full it was clamped to "A5 Kraft…" in the narrow column.
  const displayName = shortName(isRTL ? (product.nameAr || product.name) : product.name);

  // A bag can outlive the stock it was filled from. Flag the line instead of
  // letting it look ordinary all the way to a rejected checkout.
  const isOutOfStock = product.stock <= 0 || product.status !== 'Active';

  // Laid out like a line in the slide-in bag: the name and specs get the whole
  // middle column, and the stepper and line total share the row under them
  // (a 64px photo on phones leaves that row room). Side by side with the
  // stepper, the name had ~120px and wrapped or clipped.
  return (
    <div className={`flex items-start gap-4 py-6 ${isOutOfStock ? 'opacity-70' : ''}`}>
      <Link
        href={lp(`/product/${product.slug}`)}
        className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white border border-line shrink-0 shadow-xs"
      >
        <Image
          src={product.image}
          alt={displayName}
          fill
          sizes="96px"
          className="object-cover object-center"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <Link
              href={lp(`/product/${product.slug}`)}
              className="font-semibold text-char text-base hover:text-maroon transition-colors line-clamp-2"
            >
              {displayName}
            </Link>
            <div className="text-xs text-muted">
              <SpecLine
                parts={[
                  sizeLabel(product.size, locale),
                  `${formatNumber(product.sheets, locale)} ${t.common.sheets}`,
                  `${formatNumber(product.gsm, locale)} ${t.common.gsm}`,
                ]}
                locale={locale}
              />
            </div>
            {isOutOfStock && (
              <div className="text-xs font-semibold text-error">{t.cart.outOfStockLine}</div>
            )}
          </div>

          {/* A 44px target, pulled into the corner so the cross lines up with the name. */}
          <button
            type="button"
            onClick={() => removeItem(product.sku)}
            className="shrink-0 -mt-2.5 -me-2.5 w-11 h-11 inline-flex items-center justify-center text-muted hover:text-error hover:bg-error/5 rounded-xl transition-colors cursor-pointer"
            aria-label={`${t.cart.remove} ${displayName}`}
            title={t.cart.remove}
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <QuantityStepper
            qty={qty}
            max={Math.max(1, Math.min(MAX_LINE_QTY, product.stock))}
            min={1}
            disabled={isOutOfStock}
            onChange={(newQty) => updateQty(product.sku, newQty)}
          />

          {/* Wraps under the stepper rather than overflow a narrow phone. */}
          <div className="ms-auto text-end">
            <div className="font-bold text-maroon text-lg">
              <Price
                value={lineTotal(product.price, qty)}
                locale={locale}
                currencyClassName="text-xs font-normal text-muted"
              />
            </div>
            <div className="text-xs text-muted">
              <Price value={product.price} locale={locale} /> {t.cart.each}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
