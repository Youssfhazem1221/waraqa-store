'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import { useLanguage } from '@/context/LanguageContext';
import { MAX_LINE_QTY } from '@/lib/constants';
import { formatNumber } from '@/lib/format';

interface QuantityStepperProps {
  qty: number;
  max?: number;
  min?: number;
  onChange: (qty: number) => void;
  disabled?: boolean;
}

export default function QuantityStepper({
  qty,
  max = MAX_LINE_QTY,
  min = 1,
  onChange,
  disabled = false,
}: QuantityStepperProps) {
  const { t, locale } = useLanguage();

  const handleDecrement = () => {
    if (qty > min) onChange(qty - 1);
  };

  const handleIncrement = () => {
    if (qty < max) onChange(qty + 1);
  };

  // p-3.5 around a 16px icon: 44px square buttons, a full thumb on a phone.
  return (
    <div className="inline-flex items-center border border-char/30">
      <button
        type="button"
        disabled={disabled || qty <= min}
        onClick={handleDecrement}
        className="p-3.5 text-maroon hover:bg-maroon/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        aria-label={t.common.decreaseQty}
      >
        <Icon name="minus" size={16} />
      </button>

      <span className="w-10 text-center text-char tabular-nums select-none" aria-live="polite">
        {formatNumber(qty, locale)}
      </span>

      <button
        type="button"
        disabled={disabled || qty >= max}
        onClick={handleIncrement}
        className="p-3.5 text-maroon hover:bg-maroon/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        aria-label={t.common.increaseQty}
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}
