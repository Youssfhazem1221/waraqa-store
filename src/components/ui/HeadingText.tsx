import React from 'react';
import type { Locale } from '@/lib/translations';

// A Latin run ("A5", "WRQ-SQ-250"; words with spaces between them stay one
// run, so they keep their order) or a number in Arabic-Indic digits
// («٢٥×٣٥», «١٠٫٥», «٣٠»). Each starts and ends on a letter or digit and
// keeps the marks that join one (×, a decimal point, a range dash, a hyphen).
const RUN =
  /([A-Za-z0-9](?:[A-Za-z0-9×., ⁠–-]*[A-Za-z0-9])?|[٠-٩](?:[٠-٩×.,٫٬⁠–-]*[٠-٩])?)/;

/**
 * Heading text set to the brand rules (BRAND_GUIDELINES.md §4): Reem Kufi is
 * for Arabic letters. In an Arabic heading a number (a size such as «٢٥×٣٥»,
 * «٣٠ حاجة», a numbered «١.») takes Readex Pro like every other number on
 * the site, and so does a Latin token (A5, A4, a code), which also stays one
 * left-to-right run, as an identifier. English headings are Readex Pro
 * throughout and pass through as they are.
 */
export default function HeadingText({ text, locale }: { text: string; locale: Locale }) {
  if (locale !== 'ar') return <>{text}</>;
  const parts = text.split(RUN);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return part;
        // An x between two digits is a multiplication sign typed on a Latin
        // keyboard ("25x35"), not a letter.
        const latin = /[A-Za-z]/.test(part.replace(/([0-9٠-٩])[xX](?=[0-9٠-٩])/g, '$1'));
        return latin ? (
          <bdi key={i} dir="ltr" data-ident className="font-sans">
            {part}
          </bdi>
        ) : (
          <span key={i} className="font-sans">
            {part}
          </span>
        );
      })}
    </>
  );
}
