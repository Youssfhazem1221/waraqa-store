import React from 'react';
import type { Locale } from '@/lib/translations';
import { factSeparator } from '@/lib/format';

/**
 * Product facts joined by " · " (Arabic: «، », see factSeparator), each one
 * isolated and kept in one box. In an Arabic line the runs used to regroup
 * across the separators ("25×35cm · 20 ورقة" read «ورقة 35cm · 20×25») and a
 * weight could wrap between its number and its unit.
 */
export default function SpecLine({
  parts,
  locale,
}: {
  parts: (string | false | null | undefined)[];
  locale: Locale;
}) {
  const separator = factSeparator(locale);
  return (
    <>
      {parts.filter(Boolean).map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 && separator}
          <bdi className="inline-block whitespace-nowrap">{part}</bdi>
        </React.Fragment>
      ))}
    </>
  );
}
