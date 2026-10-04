import React from 'react';

/**
 * Server-only JSON-LD emitter. `dangerouslySetInnerHTML` is needed for a raw
 * <script> body, and it is confined to this one component so no page repeats
 * the pattern.
 *
 * The payload is not purely our own: product names and descriptions come from
 * the Google Sheet through the live catalog. JSON.stringify leaves `<` alone, so
 * a name containing `</script><script>…` would close this tag and run as page
 * script. Escaping `<`, `>` and `&` as \u escapes keeps the JSON identical to
 * parsers while making it impossible to break out of the tag.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
