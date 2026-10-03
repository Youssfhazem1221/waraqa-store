'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import QuantityStepper from './QuantityStepper';
import { formatAmount, lineTotal } from '@/lib/money';
import { shortName } from '@/lib/api';
import { mediumFor } from '@/lib/paper';

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

  const fullName = isRTL ? (product.nameAr || product.name) : product.name;
  const displayName = shortName(fullName);
  const description = isRTL ? (product.descriptionAr || product.description) : product.description;
  const medium = mediumFor(product.gsm);
  const goodFor = t.guide[`${medium}Title`].split(/[,،]\s*/);

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

  // The mobile bar only appears once the main button has scrolled away, so the
  // page never shows two add-to-bag buttons at once.
  const buyRef = useRef<HTMLDivElement>(null);
  const [buyVisible, setBuyVisible] = useState(true);
  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setBuyVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, qty);
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 2000);
  };

  const buttonLabel = isOutOfStock
    ? t.product.currentlySoldOut
    : added
    ? t.product.addedToBag
    : `${t.shop.addToBag} · ${formatAmount(lineTotal(product.price, qty))} ${t.common.currency}`;

  const facts: [string, string][] = [
    [t.product.sizeLabel, product.size],
    [t.common.sheetsCount, String(product.sheets)],
    [t.common.paperWeight, `${product.gsm} ${t.common.gsm}`],
  ];

  const specs: [string, string][] = [
    [t.common.format, product.size],
    [t.common.paperWeight, `${product.gsm} ${t.common.gsm}`],
    [t.common.pageCount, `${product.sheets} ${t.common.sheets}`],
    [t.common.paperType, product.paperType],
    ['SKU', product.sku],
  ];

  const trust = [
    { icon: 'truck' as const, text: t.product.deliveryNote },
    { icon: 'card' as const, text: t.product.codNote },
    { icon: 'shield' as const, text: t.product.checkedNote },
  ];

  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted">
        {product.paperType} · {product.size}
      </p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-char leading-[1.05]">
        {displayName}
      </h1>

      <div className="mt-5 flex items-baseline gap-3">
        <span className="text-3xl font-semibold text-char tabular-nums">
          {formatAmount(product.price)} <span className="text-base font-normal text-muted">{t.common.currency}</span>
        </span>
        {product.compareAt > product.price && (
          <span className="text-lg text-muted line-through tabular-nums">
            {formatAmount(product.compareAt)}
          </span>
        )}
      </div>

      <p
        className={`mt-2 inline-flex items-center gap-2 text-sm ${
          isOutOfStock ? 'text-error' : isLowStock ? 'text-terra' : 'text-success'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-current" aria-hidden />
        {isOutOfStock
          ? t.common.soldOut
          : isLowStock
          ? `${t.product.onlyLeft} ${product.stock} ${t.common.leftInStock}`
          : t.common.inStock}
      </p>

      <p className="mt-6 text-char/85 leading-relaxed">{description}</p>

      <div className="mt-6">
        <p className="text-sm text-muted">{t.product.bestFor}</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {goodFor.map((m) => (
            <li key={m} className="border border-char/20 px-3 py-1.5 text-sm text-char first-letter:uppercase">
              {m}
            </li>
          ))}
        </ul>
      </div>

      <dl className="mt-6 grid grid-cols-3 border border-line divide-x divide-line rtl:divide-x-reverse text-center">
        {facts.map(([label, value]) => (
          <div key={label} className="py-3 px-2">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-0.5 font-semibold text-char">{value}</dd>
          </div>
        ))}
      </dl>

      <div ref={buyRef} className="mt-8 flex items-stretch gap-3">
        <QuantityStepper qty={qty} max={maxQty} min={1} onChange={setQty} disabled={isOutOfStock} />
        <Button size="lg" disabled={isOutOfStock} onClick={handleAddToCart} className="flex-1" aria-live="polite">
          <Icon name={added ? 'check' : 'bag'} size={18} />
          {buttonLabel}
        </Button>
      </div>

      <ul className="mt-6 grid sm:grid-cols-3 gap-3 text-sm">
        {trust.map((item) => (
          <li key={item.icon} className="flex items-start gap-2 text-char/80">
            <Icon name={item.icon} size={18} className="text-maroon shrink-0 mt-0.5" />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-10 border-t border-line">
        {[
          {
            title: t.product.specsTitle,
            open: true,
            body: (
              <dl className="text-sm">
                {specs.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-6 py-2 border-b border-line last:border-b-0">
                    <dt className="text-muted">{label}</dt>
                    <dd className="text-char text-end">{value}</dd>
                  </div>
                ))}
              </dl>
            ),
          },
          { title: t.product.deliveryTitle, open: false, body: <p className="leading-relaxed">{t.product.deliveryBody}</p> },
        ].map((section) => (
          <details key={section.title} open={section.open} className="group border-b border-line">
            <summary className="flex items-center justify-between py-4 cursor-pointer list-none font-medium text-char [&::-webkit-details-marker]:hidden">
              {section.title}
              <Icon name="plus" size={16} className="text-muted transition-transform group-open:rotate-45" />
            </summary>
            <div className="pb-5 text-char/80">{section.body}</div>
          </details>
        ))}
      </div>

      {/* Mobile: keep buying one thumb-tap away while reading the details. */}
      <div
        className={`lg:hidden fixed inset-x-0 bottom-0 z-30 bg-cream/95 backdrop-blur-sm border-t border-line px-4 py-3 flex items-center gap-3 transition-transform duration-300 ${
          buyVisible ? 'translate-y-full' : 'translate-y-0'
        }`}
        aria-hidden={buyVisible}
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm text-char truncate">{displayName}</p>
          <p className="font-semibold tabular-nums">
            {formatAmount(product.price)} {t.common.currency}
          </p>
        </div>
        <Button
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          tabIndex={buyVisible ? -1 : 0}
          className="shrink-0"
        >
          <Icon name={added ? 'check' : 'bag'} size={16} />
          {isOutOfStock ? t.common.soldOut : added ? t.product.added : t.shop.addToBag}
        </Button>
      </div>
    </div>
  );
}
