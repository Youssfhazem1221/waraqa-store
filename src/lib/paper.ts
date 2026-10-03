// Which media a paper weight suits. One definition, shared by the home page
// paper guide, product cards and the product page, so the advice never
// disagrees with itself.

export type Medium = 'dry' | 'ink' | 'wet';

export function mediumFor(gsm: number): Medium {
  if (gsm >= 300) return 'wet';
  if (gsm > 180) return 'ink';
  return 'dry';
}
