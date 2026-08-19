// ============================================================
// Waraqa Store — WhatsApp Message Builder
// ============================================================

import type { CustomerInfo, CartItem } from '@/types';
import { WHATSAPP_NUMBER, CURRENCY } from './constants';

/**
 * Build the WhatsApp message URL for order confirmation.
 * Opens wa.me with a pre-filled message containing the order details.
 */
export function buildWhatsAppUrl(
  orderId: string,
  customer: CustomerInfo,
  items: CartItem[],
  subtotal: number,
  shipping: number,
  total: number,
  payment: string = 'Cash on delivery'
): string {
  const itemLines = items
    .map((item) => `${item.product.name} ×${item.qty}`)
    .join(', ');

  const message = [
    `New Waraqa order ${orderId}`,
    `${customer.name} — ${customer.phone}`,
    `${customer.governorate}${customer.city ? ' / ' + customer.city : ''} / ${customer.address}`,
    itemLines,
    `Shipping ${shipping} · TOTAL ${total} ${CURRENCY}`,
    `Payment: ${payment}`,
  ].join('\n');

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

/**
 * Build a WhatsApp URL from raw order data (for fallback when POST fails).
 */
export function buildWhatsAppFallbackUrl(
  customer: CustomerInfo,
  items: CartItem[],
  subtotal: number,
  shipping: number,
  total: number
): string {
  return buildWhatsAppUrl(
    'PENDING',
    customer,
    items,
    subtotal,
    shipping,
    total
  );
}

/**
 * Open WhatsApp in a new tab/window.
 */
export function openWhatsApp(url: string): void {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
