'use client';

// Shipping zones as the Sheet has them (edited on the CRM's Shipping page).
// The layout renders with the zones it read on the server; the browser then
// re-reads them once, so even a pre-rendered page quotes today's rates.

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { DEFAULT_ZONES, type ShippingZone } from '@/lib/constants';
import { fetchLiveCatalog } from '@/lib/api';

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
