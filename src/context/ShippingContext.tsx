'use client';

// Shipping zones as the Sheet has them (edited on the CRM's Shipping page).
// The layout renders with the zones it read on the server; the browser then
// re-reads them once, so even a pre-rendered page quotes today's rates.

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { DEFAULT_ZONES, type ShippingZone } from '@/lib/constants';
import { fetchLiveCatalog } from '@/lib/api';
import { fillRates, homeRates } from '@/lib/shipping-copy';
import { useLanguage } from '@/context/LanguageContext';

const Ctx = createContext<ShippingZone[]>(DEFAULT_ZONES);

export function ShippingProvider({ zones, children }: { zones: ShippingZone[]; children: ReactNode }) {
  const [live, setLive] = useState(zones);
  useEffect(() => {
    let alive = true;
    fetchLiveCatalog().then((c) => {
      if (alive && c?.zones.length) setLive(c.zones);
    });
    return () => {
      alive = false;
    };
  }, []);
  return <Ctx.Provider value={live}>{children}</Ctx.Provider>;
}

export function useShippingZones(): ShippingZone[] {
  return useContext(Ctx);
}

/** Fills {homeFee} / {restFee} / {freeOver} in a translation with the live fees. */
export function useRateText(): (text: string) => string {
  const zones = useShippingZones();
  const { locale } = useLanguage();
  return useCallback((text: string) => fillRates(text, homeRates(zones), locale), [zones, locale]);
}
