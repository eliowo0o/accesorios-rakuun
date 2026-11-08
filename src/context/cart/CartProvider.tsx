"use client";

import { createContext, useMemo, useState, type ReactNode } from "react";
import type { CartItem } from "@/types";
import type { CartApi } from "./cart.types";

/**
 * STUB de Fase 0 (estado en memoria con useState) para que la Tienda pueda compilar.
 * El agente Carrito lo reemplaza por useReducer + persistencia, manteniendo CartApi.
 */
export const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const api = useMemo<CartApi>(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const total = items.reduce((n, i) => n + i.quantity * i.price, 0);
    return {
      items,
      count,
      total,
      add: (item, quantity = 1) =>
        setItems((prev) => {
          const found = prev.find((i) => i.productId === item.productId);
          return found
            ? prev.map((i) => (i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i))
            : [...prev, { ...item, quantity }];
        }),
      remove: (id) => setItems((prev) => prev.filter((i) => i.productId !== id)),
      setQuantity: (id, q) =>
        setItems((prev) => (q <= 0 ? prev.filter((i) => i.productId !== id) : prev.map((i) => (i.productId === id ? { ...i, quantity: q } : i)))),
      clear: () => setItems([]),
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}
