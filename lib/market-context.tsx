'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  ensureSeeded,
  getGcvOnly,
  setGcvOnly,
  getSellers,
  getProducts,
} from './storage';
import { Product, Seller } from './types';

interface MarketContextValue {
  ready: boolean;
  gcvOnly: boolean;
  setGcvOnly: (v: boolean) => void;
  sellers: Seller[];
  products: Product[];
  refresh: () => void;
}

const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [gcvOnly, setGcvOnlyState] = useState(false);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const refresh = useCallback(() => {
    setSellers(getSellers());
    setProducts(getProducts());
  }, []);

  useEffect(() => {
    ensureSeeded();
    setGcvOnlyState(getGcvOnly());
    refresh();
    setReady(true);
  }, [refresh]);

  const toggleGcvOnly = useCallback((v: boolean) => {
    setGcvOnly(v);
    setGcvOnlyState(v);
  }, []);

  return (
    <MarketContext.Provider
      value={{ ready, gcvOnly, setGcvOnly: toggleGcvOnly, sellers, products, refresh }}
    >
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket(): MarketContextValue {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be used within MarketProvider');
  return ctx;
}
