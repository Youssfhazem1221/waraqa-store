'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { CartItem, CartAction, Product } from '@/types';
import { SHIPPING_FLAT, FREE_SHIP_OVER } from '@/lib/constants';

// ---- State ----
interface CartState {
  items: CartItem[];
  isHydrated: boolean;
}

const initialState: CartState = { items: [], isHydrated: false };

// ---- Reducer ----
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.product.sku === action.product.sku);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.sku === action.product.sku
              ? { ...i, qty: Math.min(i.qty + action.qty, i.product.stock) }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { product: action.product, qty: action.qty }],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.product.sku !== action.sku),
      };
    case 'UPDATE_QTY':
      if (action.qty <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.product.sku !== action.sku),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.sku === action.sku
            ? { ...i, qty: Math.min(action.qty, i.product.stock) }
            : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'HYDRATE':
      return { ...state, items: action.items, isHydrated: true };
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
  shipping: number;
  total: number;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (sku: string) => void;
  updateQty: (sku: string, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'waraqa-cart';

// ---- Provider ----
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: 'HYDRATE', items: parsed });
          return;
        }
      }
    } catch {
      // Ignore parse errors
    }
    dispatch({ type: 'HYDRATE', items: [] });
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

  // Computed values
  const itemCount = state.items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const shipping = subtotal >= FREE_SHIP_OVER ? 0 : SHIPPING_FLAT;
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

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isHydrated: state.isHydrated,
        itemCount,
        subtotal,
        shipping,
        total,
        addItem,
        removeItem,
        updateQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ---- Hook ----
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
