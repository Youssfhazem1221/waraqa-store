'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CartItem as CartItemType } from '@/types';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import Icon from '@/components/ui/Icon';
import QuantityStepper from '@/components/product/QuantityStepper';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQty, removeItem } = useCart();
  const { t, isRTL } = useLanguage();
  const { product, qty } = item;

  const displayName = isRTL ? (product.nameAr || product.name) : product.name;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6 border-b border-line">
      {/* Product Image & Info */}
      <div className="flex items-center gap-4 flex-1">
        <Link
          href={`/product/${product.slug}`}
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white border border-line shrink-0 shadow-xs"
        >
          <Image
            src={product.image}
            alt={displayName}
            fill
            sizes="96px"
            className="object-cover object-center"
          />
        </Link>

        <div className="space-y-1">
          <Link
            href={`/product/${product.slug}`}
            className="font-semibold text-char text-base hover:text-maroon transition-colors line-clamp-1"
          >
            {displayName}
          </Link>
          <div className="text-xs text-muted">
            <span>{product.size}</span> · <span>{product.sheets} {t.common.sheets}</span> · <span>{product.gsm} {t.common.gsm}</span>
          </div>
          <div className="text-sm font-semibold text-maroon sm:hidden">
            {product.price * qty} {t.common.currency}
          </div>
        </div>
      </div>

      {/* Stepper, Line Total, Remove */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
        <QuantityStepper
          qty={qty}
          max={Math.max(1, product.stock)}
          min={1}
          onChange={(newQty) => updateQty(product.sku, newQty)}
        />

        <div className="hidden sm:block text-right min-w-[90px]">
          <div className="font-serif font-bold text-maroon text-lg">
            {product.price * qty} <span className="text-xs font-sans font-normal text-muted">{t.common.currency}</span>
          </div>
          <div className="text-[11px] text-muted">
            {product.price} {t.common.currency} {t.cart.each}
          </div>
        </div>

        <button
          type="button"
          onClick={() => removeItem(product.sku)}
          className="p-2 text-muted hover:text-error hover:bg-error/5 rounded-xl transition-colors cursor-pointer"
          aria-label={`Remove ${displayName}`}
          title={t.cart.clearBag}
        >
          <Icon name="close" size={18} />
        </button>
      </div>
    </div>
  );
}
