import React from 'react';

/**
 * Server-only JSON-LD emitter. `dangerouslySetInnerHTML` is correct here — the
 * payload is our own object graph run through JSON.stringify, never user input —
 * but it is confined to this one component so no page repeats the pattern.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
