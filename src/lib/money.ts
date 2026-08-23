// ============================================================
// Waraqa Store — Money formatting
// ============================================================
// Prices come out of a Google Sheet, so a cell can legitimately hold 249.5.
// Multiplying that by a quantity in binary floating point yields values like
// 748.5000000000001, which used to be rendered verbatim. Round to piastres and
// drop the decimals when they are zero.
// ============================================================

/** Round to 2 decimal places, killing float dust. */
export function round2(value: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

/** Format an amount for display, without a currency suffix. */
export function formatAmount(value: number): string {
  const n = round2(value);
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

/** Total for one cart line. */
export function lineTotal(price: number, qty: number): number {
  return round2(Number(price) * Number(qty));
}
