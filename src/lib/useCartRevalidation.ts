'use client';

import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { fetchLiveProducts, reconcileCart } from '@/lib/api';

/** One thing that changed in the bag since its lines were added. */
export type CartNotice =
  | { kind: 'removed'; product: Product }
  | { kind: 'repriced'; product: Product; oldPrice: number }
  | { kind: 'reduced'; product: Product };

/**
 * Re-check the bag against the live catalog once it is on screen.
 *
 * Cart lines are localStorage snapshots: the price and stock in them are
 * whatever they were when the item was added. This runs on the bag page and at
 * checkout, because the slide-in bag sends shoppers straight to checkout and
 * the bag page used to be the only place a stale line was caught.
 *
 * The catalog read can take tens of seconds, so its answer is applied to the
 * bag as it is when the read returns, not as it was when it started: a
 * quantity changed in the meantime is kept.
 */
export function useCartRevalidation(): CartNotice[] {
  const { items, isHydrated, replaceItems } = useCart();
  const [notices, setNotices] = useState<CartNotice[]>([]);

  const started = useRef(false);
  const mounted = useRef(false);
  const latest = useRef(items);

  useEffect(() => {
    latest.current = items;
  }, [items]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const hasItems = items.length > 0;

  useEffect(() => {
    if (!isHydrated || !hasItems || started.current) return;
    started.current = true;

    fetchLiveProducts().then((live) => {
      // A failed read changes nothing: the order endpoint re-prices and
      // re-checks stock before anything is committed.
      if (!mounted.current || !live) return;

      const res = reconcileCart(latest.current, live);
      if (!res.removed.length && !res.repriced.length && !res.reduced.length) return;

      replaceItems(res.items);
      setNotices([
        ...res.removed.map(({ product }): CartNotice => ({ kind: 'removed', product })),
        ...res.repriced.map(({ item, oldPrice }): CartNotice => ({ kind: 'repriced', product: item.product, oldPrice })),
        ...res.reduced.map(({ item }): CartNotice => ({ kind: 'reduced', product: item.product })),
      ]);
    });
  }, [isHydrated, hasItems, replaceItems]);

  return notices;
}
