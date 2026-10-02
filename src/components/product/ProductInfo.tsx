'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import Button from '@/components/ui/Button';
import QuantityStepper from './QuantityStepper';
import { formatAmount, lineTotal } from '@/lib/money';

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const { addItem } = useCart();
  const { t, isRTL } = useLanguage();
  const [requestedQty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // A live stock drop (or navigating to a product with less stock) must not
  // leave a quantity above what we can actually ship. Derived at render, so
  // there is no window in which a too-large quantity is displayed or added.
  const maxQty = Math.max(1, product.stock);
  const qty = Math.min(Math.max(1, requestedQty), maxQty);

  const isOutOfStock = product.stock <= 0 || product.status === 'Out of stock';
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const displayName = isRTL ? (product.nameAr || product.name) : product.name;
  const subtitle = isRTL
    ? `${product.paperType} · ${product.gsm} جرام · ${product.sheets} ورقة`
    : `${product.paperType} · ${product.gsm} GSM · ${product.sheets} Sheets`;

  // Held in a ref so rapid clicks restart one timer instead of stacking
  // several, and so an unmount (navigating away) cancels it rather than
  // setting state on a component that is gone.
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    },
    []
  );

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, qty);
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 2000);
  };

  // Same weight bands as the home page paper guide, so the advice matches.
  const bestFor =
    product.gsm >= 300 ? t.guide.wetTitle : product.gsm > 180 ? t.guide.inkTitle : t.guide.dryTitle;

  const specs: [string, string][] = [
    [t.common.format, product.size],
    [t.common.paperWeight, `${product.gsm} ${t.common.gsm}`],
    [t.common.pageCount, `${product.sheets} ${t.common.sheets}`],
    [t.common.paperType, product.paperType],
    [t.product.bestFor, bestFor],
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-char leading-tight">
        {displayName}
      </h1>
      <p className="mt-2 text-muted">{subtitle}</p>

      <div className="mt-6 flex items-baseline gap-3">
        <span className="text-2xl sm:text-3xl text-char tabular-nums">
          {formatAmount(product.price)} <span className="text-base text-muted">{t.common.currency}</span>
        </span>
        {product.compareAt > product.price && (
          <span className="text-lg text-muted line-through tabular-nums">
            {formatAmount(product.compareAt)}
          </span>
        )}
      </div>

      <p className={`mt-2 text-sm ${isOutOfStock ? 'text-error' : isLowStock ? 'text-warning' : 'text-success'}`}>
        {isOutOfStock
          ? t.common.soldOut
          : isLowStock
          ? `${t.product.onlyLeft} ${product.stock} ${t.common.leftInStock}`
          : t.common.inStock}
      </p>

      <p className="mt-6 text-char/85 leading-relaxed">
        {isRTL ? (product.descriptionAr || product.description) : product.description}
      </p>

      <div className="mt-8 flex items-stretch gap-3">
        <QuantityStepper
          qty={qty}
          max={maxQty}
          min={1}
          onChange={setQty}
          disabled={isOutOfStock}
        />
        <Button
          size="lg"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="flex-1"
          aria-live="polite"
        >
          {isOutOfStock
            ? t.product.currentlySoldOut
            : added
            ? t.product.addedToBag
            : `${t.shop.addToBag} · ${formatAmount(lineTotal(product.price, qty))} ${t.common.currency}`}
        </Button>
      </div>

      <dl className="mt-10 border-t border-line text-sm">
        {specs.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-6 py-3 border-b border-line">
            <dt className="text-muted">{label}</dt>
            <dd className="text-char text-end">{value}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-6 space-y-1 text-sm text-muted">
        <li>{t.product.deliveryNote}</li>
        <li>{t.product.codNote}</li>
      </ul>
    </div>
  );
}
