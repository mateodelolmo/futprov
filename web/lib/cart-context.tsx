"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartProduct = {
  handle: string;
  title: string;
  priceCents: number;
};

type CartContextValue = {
  items: string[];
  products: CartProduct[];
  add: (handle: string) => void;
  remove: (handle: string) => void;
  clear: () => void;
  has: (handle: string) => boolean;
  count: number;
  totalCents: number;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "fp-cart";

export function CartProvider({ products, children }: { products: CartProduct[]; children: React.ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage no disponible, carrito vacio
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignorar
    }
  }, [items, hydrated]);

  const add = useCallback((handle: string) => {
    setItems((prev) => (prev.includes(handle) ? prev : [...prev, handle]));
  }, []);

  const remove = useCallback((handle: string) => {
    setItems((prev) => prev.filter((h) => h !== handle));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const has = useCallback((handle: string) => items.includes(handle), [items]);

  const totalCents = useMemo(
    () => items.reduce((sum, handle) => sum + (products.find((p) => p.handle === handle)?.priceCents ?? 0), 0),
    [items, products]
  );

  const value: CartContextValue = {
    items,
    products,
    add,
    remove,
    clear,
    has,
    count: items.length,
    totalCents,
    open,
    setOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
