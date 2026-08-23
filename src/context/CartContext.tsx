'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type { CartItem, CartAction, Product } from '@/types';
import { quoteShipping, type ShippingQuote } from '@/lib/constants';

// ---- State ----
interface CartState {
  items: CartItem[];
  isHydrated: boolean;
}

const initialState: CartState = { items: [], isHydrated: false };

/** Largest quantity of one SKU a single order may contain. */
const MAX_LINE_QTY = 99;

/** Stock ceiling for a line. Products with an unknown/absent stock count fall
 *  back to the order cap rather than to 0, which would make them unbuyable. */
function lineCap(product: Product): number {
  const stock = Number(product.stock);
  if (!Number.isFinite(stock) || stock <= 0) return 0;
  return Math.min(stock, MAX_LINE_QTY);
}

function clampQty(product: Product, qty: number): number {
  const wanted = Math.floor(Number(qty));
  if (!Number.isFinite(wanted) || wanted <= 0) return 0;
  return Math.min(wanted, lineCap(product));
}

/**
 * Accept a persisted cart only if every line still looks like a cart line.
 * A half-written or hand-edited localStorage value used to reach the render
 * path and crash the cart page on `item.product.price`.
 */
function parseStoredItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();
  const items: CartItem[] = [];

  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const { product, qty } = entry as { product?: unknown; qty?: unknown };
    if (!product || typeof product !== 'object') continue;

    const p = product as Partial<Product>;
    if (typeof p.sku !== 'string' || !p.sku) continue;
    if (typeof p.name !== 'string') continue;
    if (!Number.isFinite(Number(p.price))) continue;

    const n = Math.floor(Number(qty));
    if (!Number.isFinite(n) || n <= 0) continue;

    // Two lines for one SKU would render duplicate React keys and double-count
    // the subtotal.
    if (seen.has(p.sku)) continue;
    seen.add(p.sku);

    items.push({
      product: product as Product,
      qty: Math.min(n, MAX_LINE_QTY),
    });
  }

  return items;
}

// ---- Reducer ----
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const cap = lineCap(action.product);
      if (cap <= 0) return state;

      const existing = state.items.find((i) => i.product.sku === action.product.sku);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.sku === action.product.sku
              ? {
                  // Refresh the snapshot too: the shopper is looking at the
                  // newer price/stock right now, so the line should match it.
                  product: action.product,
                  qty: Math.min(i.qty + Math.max(1, Math.floor(action.qty)), cap),
                }
              : i
          ),
        };
      }

      // A brand-new line was previously trusted verbatim, so "add 50" on a
      // 2-in-stock product put 50 in the bag.
      const qty = clampQty(action.product, action.qty);
      if (qty <= 0) return state;

      return {
        ...state,
        items: [...state.items, { product: action.product, qty }],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.product.sku !== action.sku),
      };
    case 'UPDATE_QTY': {
      const target = state.items.find((i) => i.product.sku === action.sku);
      if (!target) return state;

      const qty = clampQty(target.product, action.qty);
      if (qty <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.product.sku !== action.sku),
        };
      }
      if (qty === target.qty) return state;

      return {
        ...state,
        items: state.items.map((i) =>
          i.product.sku === action.sku ? { ...i, qty } : i
        ),
      };
    }
    case 'CLEAR_CART':
      return state.items.length === 0 ? state : { ...state, items: [] };
    case 'HYDRATE':
      return { ...state, items: action.items, isHydrated: true };
    case 'REPLACE_ITEMS':
      return { ...state, items: action.items };
    default:
      return state;
  }
}

// ---- Context ----
interface CartContextValue {
  items: CartItem[];
  isHydrated: boolean;
  itemCount: number;
  subtotal: number;
  /**
   * Delivery fee with no address known — the low end of the range.
   * Check `shippingQuote.exact` before presenting it as final; the bag shows a
   * range, checkout shows the real figure once a governorate is picked.
   */
  shipping: number;
  /** The same fee with its range and certainty attached. */
  shippingQuote: ShippingQuote;
  /** Subtotal + the estimated fee. Use totalFor(governorate) at checkout. */
  total: number;
  /** Exact quote for a chosen governorate. */
  quoteFor: (governorate?: string) => ShippingQuote;
  /** Subtotal + the exact fee for a chosen governorate. */
  totalFor: (governorate?: string) => number;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (sku: string) => void;
  updateQty: (sku: string, qty: number) => void;
  clearCart: () => void;
  replaceItems: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'waraqa-cart';

// ---- Provider ----
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    let items: CartItem[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) items = parseStoredItems(JSON.parse(stored));
    } catch {
      // Ignore parse errors
    }
    dispatch({ type: 'HYDRATE', items });
  }, []);

  // Persist to localStorage on every change (after hydration)
  useEffect(() => {
    if (state.isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
      } catch {
        // Ignore storage errors
      }
    }
  }, [state.items, state.isHydrated]);

  // Keep the bag in sync across tabs — two open tabs used to overwrite each
  // other's cart, since each only ever wrote its own copy.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        dispatch({
          type: 'REPLACE_ITEMS',
          items: e.newValue ? parseStoredItems(JSON.parse(e.newValue)) : [],
        });
      } catch {
        // Ignore
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Computed values
  const { itemCount, subtotal } = useMemo(() => {
    let count = 0;
    let sum = 0;
    for (const i of state.items) {
      count += i.qty;
      sum += i.product.price * i.qty;
    }
    // Round to whole piastres so floating-point prices never render as
    // "748.5000000000001 EGP".
    return { itemCount: count, subtotal: Math.round(sum * 100) / 100 };
  }, [state.items]);

  const quoteFor = useCallback(
    (governorate?: string) => quoteShipping(subtotal, governorate),
    [subtotal]
  );

  const totalFor = useCallback(
    (governorate?: string) => subtotal + quoteShipping(subtotal, governorate).amount,
    [subtotal]
  );

  // Address-less quote, for anything rendered before checkout.
  const shippingQuote = useMemo(() => quoteShipping(subtotal), [subtotal]);
  const shipping = shippingQuote.amount;
  const total = subtotal + shipping;

  // Actions
  const addItem = useCallback((product: Product, qty = 1) => {
    dispatch({ type: 'ADD_ITEM', product, qty });
  }, []);

  const removeItem = useCallback((sku: string) => {
    dispatch({ type: 'REMOVE_ITEM', sku });
  }, []);

  const updateQty = useCallback((sku: string, qty: number) => {
    dispatch({ type: 'UPDATE_QTY', sku, qty });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const replaceItems = useCallback((items: CartItem[]) => {
    dispatch({ type: 'REPLACE_ITEMS', items });
  }, []);

  // Memoised so the provider does not hand every consumer a new object (and a
  // guaranteed re-render) on each render of its parent.
  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      isHydrated: state.isHydrated,
      itemCount,
      subtotal,
      shipping,
      shippingQuote,
      total,
      quoteFor,
      totalFor,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      replaceItems,
    }),
    [
      state.items,
      state.isHydrated,
      itemCount,
      subtotal,
      shipping,
      shippingQuote,
      total,
      quoteFor,
      totalFor,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      replaceItems,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ---- Hook ----
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
