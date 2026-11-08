"use client";

import { use, useMemo } from "react";
import { CartActionsContext, CartStateContext } from "@/context/cart/CartProvider";
import type { CartActions, CartApi } from "@/context/cart/cart.types";

/** CONTRATO: punto de entrada único al carrito para cualquier componente. */
export function useCart(): CartApi {
  const state = use(CartStateContext);
  const actions = use(CartActionsContext);
  if (!state || !actions) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
}

/**
 * Solo las acciones (add, open, …). Referencias estables: el componente no se re-renderiza
 * cuando cambia el contenido del carrito. Útil para botones "Agregar".
 */
export function useCartActions(): CartActions {
  const actions = use(CartActionsContext);
  if (!actions) throw new Error("useCartActions debe usarse dentro de <CartProvider>");
  return actions;
}
