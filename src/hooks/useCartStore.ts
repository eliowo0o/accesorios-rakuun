"use client";

import { useMemo, useReducer } from "react";
import { cartReducer, initialCartState, selectCount, selectTotal } from "@/reducers/cartReducer";
import type { CartActions, CartStateValue } from "@/context/cart/cart.types";
import { useCartPersistence } from "./useCartPersistence";
import { useCartSync } from "./useCartSync";

/**
 * Estado completo del carrito: reducer + persistencia + sincronización con el servidor.
 * Devuelve estado y acciones por separado: las acciones son estables (dispatch nunca cambia),
 * así quien solo agrega productos no se vuelve a renderizar cuando cambia el carrito.
 */
export function useCartStore(): { state: CartStateValue; actions: CartActions } {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  useCartPersistence(state.items, state.hydrated, dispatch);
  useCartSync(state.isOpen, state.hydrated, state.items, dispatch);

  const actions = useMemo<CartActions>(
    () => ({
      add: (item, quantity) => dispatch({ type: "ADD", item, quantity }),
      remove: (productId) => dispatch({ type: "REMOVE", productId }),
      setQuantity: (productId, quantity) => dispatch({ type: "SET_QUANTITY", productId, quantity }),
      clear: () => dispatch({ type: "CLEAR" }),
      open: () => dispatch({ type: "OPEN" }),
      close: () => dispatch({ type: "CLOSE" }),
      dismissNotices: () => dispatch({ type: "DISMISS_NOTICES" }),
    }),
    [],
  );

  const { items, isOpen, hydrated, notices } = state;
  const value = useMemo<CartStateValue>(
    () => ({ items, count: selectCount(items), total: selectTotal(items), isOpen, hydrated, notices }),
    [items, isOpen, hydrated, notices],
  );

  return { state: value, actions };
}
