'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Read a value out of localStorage/sessionStorage without a hydration mismatch
 * and without a setState-in-effect round trip.
 *
 * The obvious approaches both have a flaw: reading storage in a `useState`
 * initialiser makes the first client render disagree with the server HTML (so
 * React throws the restored value away), and reading it in an effect means an
 * extra render pass on every mount. `useSyncExternalStore` is built for exactly
 * this — it returns the server snapshot during hydration and the real value
 * immediately after, and it re-reads when another tab writes the key.
 */

type Area = 'local' | 'session';

function store(area: Area): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return area === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    // Storage can throw outright when blocked by browser settings.
    return null;
  }
}

// getSnapshot must return a referentially stable value or React re-renders
// forever, so parsed results are memoised against the raw string they came from.
const parsedCache = new Map<string, { raw: string; value: unknown }>();

function readRaw(area: Area, key: string): string | null {
  try {
    return store(area)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

/**
 * Parsed JSON from storage, or `null` on the server and when absent/invalid.
 * `parse` must be pure — it runs during render.
 */
export function useStoredJson<T>(
  key: string,
  parse: (raw: unknown) => T | null,
  area: Area = 'local'
): T | null {
  const getSnapshot = useCallback((): T | null => {
    const raw = readRaw(area, key);
    if (raw === null) {
      parsedCache.delete(`${area}:${key}`);
      return null;
    }

    const cacheKey = `${area}:${key}`;
    const cached = parsedCache.get(cacheKey);
    if (cached && cached.raw === raw) return cached.value as T | null;

    let value: T | null = null;
    try {
      value = parse(JSON.parse(raw));
    } catch {
      value = null;
    }
    parsedCache.set(cacheKey, { raw, value });
    return value;
  }, [area, key, parse]);

  // `null` during server render and the hydrating pass, so markup matches.
  const getServerSnapshot = useCallback((): T | null => null, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Raw string from storage, or `null` on the server and when absent. */
export function useStoredString(key: string, area: Area = 'local'): string | null {
  const getSnapshot = useCallback(() => readRaw(area, key), [area, key]);
  const getServerSnapshot = useCallback((): string | null => null, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Write a value, notifying hooks in this tab (the storage event is cross-tab only). */
export function writeStored(key: string, value: string, area: Area = 'local') {
  try {
    store(area)?.setItem(key, value);
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: value }));
  } catch {
    // Quota or blocked storage — the in-memory state still applies.
  }
}
