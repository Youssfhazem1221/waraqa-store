'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';

interface QuantityStepperProps {
  qty: number;
  max?: number;
  min?: number;
  onChange: (qty: number) => void;
  disabled?: boolean;
}

export default function QuantityStepper({
  qty,
  max = 99,
  min = 1,
  onChange,
  disabled = false,
}: QuantityStepperProps) {
  const handleDecrement = () => {
    if (qty > min) onChange(qty - 1);
  };

  const handleIncrement = () => {
    if (qty < max) onChange(qty + 1);
  };

  return (
    <div className="inline-flex items-center border border-char/30">
      <button
        type="button"
        disabled={disabled || qty <= min}
        onClick={handleDecrement}
        className="px-3.5 py-2.5 text-maroon hover:bg-maroon/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        aria-label="Decrease quantity"
      >
        <Icon name="minus" size={16} />
      </button>

      <span className="w-10 text-center text-char tabular-nums select-none" aria-live="polite">
        {qty}
      </span>

      <button
        type="button"
        disabled={disabled || qty >= max}
        onClick={handleIncrement}
        className="px-3.5 py-2.5 text-maroon hover:bg-maroon/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        aria-label="Increase quantity"
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}
