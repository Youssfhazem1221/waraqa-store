import React from 'react';

/**
 * Phone numbers, emails and links come wrapped in LRI…PDI (ltr() in
 * lib/format); each becomes an isolated left-to-right identifier.
 */
export function withIdentifiers(text: string): React.ReactNode {
  const parts = text.split(/\u2066([^\u2069]*)\u2069/);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 ? (
      <bdi key={i} dir="ltr" data-ident>
        {part}
      </bdi>
    ) : (
      part
    )
  );
}
