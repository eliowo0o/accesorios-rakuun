"use client";

import { createContext, type ReactNode } from "react";
import { useCartStore } from "@/hooks/useCartStore";
import type { CartActions, CartStateValue } from "./cart.types";

/**
 * Dos contextos: estado (cambia) y acciones (estables). `useCart()` combina ambos (CartApi);
 * `useCartActions()` solo las acciones, para botones "Agregar" que no deben re-renderizarse.
 */
export const CartStateContext = createContext<CartStateValue | null>(null);
export const CartActionsContext = createContext<CartActions | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { state, actions } = useCartStore();
  return (
    <CartActionsContext value={actions}>
      <CartStateContext value={state}>{children}</CartStateContext>
    </CartActionsContext>
  );
}
