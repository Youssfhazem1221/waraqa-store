'use client';

import React, { useState } from 'react';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/Icon';
import QuantityStepper from './QuantityStepper';

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const { addItem } = useCart();
  const { t, isRTL } = useLanguage();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.stock <= 0 || product.status === 'Out of stock';
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const displayName = isRTL ? (product.nameAr || product.name) : product.name;
  const secondaryName = isRTL ? product.name : product.nameAr;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addItem(product, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category & Status */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-maroon">
          {product.category} · {product.size}
        </span>

        {isOutOfStock ? (
          <Badge variant="out">{t.common.soldOut}</Badge>
        ) : isLowStock ? (
          <Badge variant="warning">
            {t.product.onlyLeft} {product.stock} {t.common.leftInStock}
          </Badge>
        ) : (
          <Badge variant="success">
            {t.common.inStock} ({product.stock} {t.product.availableCount})
          </Badge>
        )}
      </div>

      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-char">
          {displayName}
        </h1>
        <p className="text-lg sm:text-xl text-muted mt-1 font-medium">
          {secondaryName}
        </p>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3 pt-1 border-b border-line pb-6">
        <span className="font-serif text-3xl sm:text-4xl font-bold text-maroon">
          {product.price}{' '}
          <span className="text-lg font-sans font-normal text-muted">{t.common.currency}</span>
        </span>
        {product.compareAt > product.price && (
          <span className="text-lg text-muted/60 line-through font-normal">
            {product.compareAt} {t.common.currency}
          </span>
        )}
      </div>

      {/* Description */}
      <div className="text-char/80 text-sm sm:text-base leading-relaxed space-y-3">
        <p>{product.description}</p>
      </div>

      {/* Specs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-line rounded-2xl p-4 text-xs">
        <div>
          <span className="text-muted block uppercase tracking-wider text-[10px] mb-0.5">
            {t.common.format}
          </span>
          <span className="font-semibold text-char">{product.size}</span>
        </div>
        <div>
          <span className="text-muted block uppercase tracking-wider text-[10px] mb-0.5">
            {t.common.paperWeight}
          </span>
          <span className="font-semibold text-char">{product.gsm} {t.common.gsm}</span>
        </div>
        <div>
          <span className="text-muted block uppercase tracking-wider text-[10px] mb-0.5">
            {t.common.pageCount}
          </span>
          <span className="font-semibold text-char">{product.sheets} {t.common.sheets}</span>
        </div>
        <div>
          <span className="text-muted block uppercase tracking-wider text-[10px] mb-0.5">
            {t.common.paperType}
          </span>
          <span className="font-semibold text-char">{product.paperType}</span>
        </div>
      </div>

      {/* Quantity & Add to Bag */}
      <div className="pt-2 space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wider text-char">
          {t.product.quantity}
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <QuantityStepper
            qty={qty}
            max={Math.max(1, product.stock)}
            min={1}
            onChange={setQty}
            disabled={isOutOfStock}
          />
          <Button
            size="lg"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="flex-1 shadow-sm"
          >
            <Icon name={added ? 'check' : 'bag'} size={20} />
            <span>
              {isOutOfStock
                ? t.product.currentlySoldOut
                : added
                ? t.product.addedToBag
                : `${t.shop.addToBag} · ${product.price * qty} ${t.common.currency}`}
            </span>
          </Button>
        </div>
      </div>

      {/* Trust guarantees */}
      <div className="pt-6 border-t border-line space-y-2 text-xs text-muted">
        <div className="flex items-center gap-2">
          <Icon name="truck" size={16} className="text-maroon" />
          <span>{t.product.deliveryNote}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="card" size={16} className="text-maroon" />
          <span>{t.product.codNote}</span>
        </div>
      </div>
    </div>
  );
}
