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
    <div className="inline-flex items-center bg-white border border-line rounded-xl overflow-hidden shadow-xs">
      <button
        type="button"
        disabled={disabled || qty <= min}
        onClick={handleDecrement}
        className="px-3.5 py-2.5 text-maroon hover:bg-cream/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        aria-label="Decrease quantity"
      >
        <Icon name="minus" size={16} />
      </button>

      <span className="w-10 text-center font-semibold text-char text-sm select-none">
        {qty}
      </span>

      <button
        type="button"
        disabled={disabled || qty >= max}
        onClick={handleIncrement}
        className="px-3.5 py-2.5 text-maroon hover:bg-cream/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        aria-label="Increase quantity"
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}
