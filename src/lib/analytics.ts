'use client';

import posthog from 'posthog-js';

/**
 * Shopping-funnel events sent to PostHog.
 *
 * Pageviews alone could not show the funnel: the bag is a slide-in panel, not
 * a page, so every add-to-bag was invisible, and a failed order looked the
 * same as a shopper who walked away. These events fill those gaps.
 *
 * Never put a shopper's name, phone, email or street address in here. The
 * governorate is the finest location an event carries.
 */
type FunnelEvents = {
  product_added_to_bag: {
    sku: string;
    product: string;
    price: number;
    qty: number;
    /** Lines in the bag before this add, to tell first adds from top-ups. */
    bag_lines_before: number;
  };
  bag_opened: { item_count: number; subtotal: number };
  checkout_started: { item_count: number; line_count: number; subtotal: number };
  checkout_invalid: { fields: string[] };
  order_submitted: { item_count: number; subtotal: number; governorate: string };
  order_placed: {
    order_id: string;
    item_count: number;
    line_count: number;
    skus: string[];
    subtotal: number;
    shipping: number;
    total: number;
    currency: 'EGP';
    governorate: string;
  };
  order_failed: { reason: 'timeout' | 'rejected' | 'network'; error?: string };
};

export type FunnelEvent = keyof FunnelEvents;

const ENABLED = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

// Child effects run before the provider's, so an event fired on a page's first
// render (checkout_started on a direct visit) would reach PostHog before init
// and be dropped. Hold those until init's `loaded` callback flushes them.
const pending: Array<[FunnelEvent, FunnelEvents[FunnelEvent]]> = [];
const MAX_PENDING = 20;

export function track<E extends FunnelEvent>(event: E, props: FunnelEvents[E]): void {
  if (!ENABLED || typeof window === 'undefined') return;
  try {
    if (posthog.__loaded) {
      posthog.capture(event, props);
    } else if (pending.length < MAX_PENDING) {
      pending.push([event, props]);
    }
  } catch {
    // Analytics must never break the storefront.
  }
}

/** Called once PostHog has initialised. */
export function flushPendingEvents(): void {
  while (pending.length > 0) {
    const [event, props] = pending.shift()!;
    try {
      posthog.capture(event, props);
    } catch {
      // Ignore; see track().
    }
  }
}
