import React from 'react';
import type { Locale } from '@/lib/translations';
import { currencyLabel, formatPriceAmount, RANGE_DASH } from '@/lib/format';

interface PriceProps {
  value: number;
  /** Upper end of a range, e.g. delivery before the governorate is known. */
  to?: number;
  locale: Locale;
  className?: string;
  /** For a smaller or muted currency next to the amount. */
  currencyClassName?: string;
}

/**
 * A price as the locale writes it: "EGP 220" / «٢٢٠ ج.م». Always Readex Pro
 * with tabular figures, and never split across lines. Inside an Arabic
 * headline or a `font-serif` row the digits used to come out in Reem Kufi.
 */
export default function Price({ value, to, locale, className = '', currencyClassName }: PriceProps) {
  const amount =
    to === undefined
      ? formatPriceAmount(value, locale)
      : `${formatPriceAmount(value, locale)}${RANGE_DASH}${formatPriceAmount(to, locale)}`;
  const currency = <span className={currencyClassName}>{currencyLabel(locale)}</span>;

  return (
    <span
      data-price={to === undefined ? true : 'range'}
      className={`font-sans tabular-nums whitespace-nowrap ${className}`}
    >
      {locale === 'ar' ? (
        <>
          {amount} {currency}
        </>
      ) : (
        <>
          {currency} {amount}
        </>
      )}
    </span>
  );
}
