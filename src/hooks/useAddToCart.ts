"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCartActions } from "@/hooks/useCart";
import { clampQuantity, MAX_QUANTITY, MIN_QUANTITY } from "@/reducers/cartReducer";
import type { CartItem } from "@/types";

/** Tiempo que se muestra el estado "Agregado". */
export const ADDED_FEEDBACK_MS = 1600;

/**
 * Agregar un producto al carrito con cantidad opcional y feedback visual temporal.
 * `item` es el snapshot que guarda el carrito (sin cantidad).
 */
export function useAddToCart(item: Omit<CartItem, "quantity">) {
  // Solo acciones: el botón no se re-renderiza cada vez que cambia el carrito.
  const { add } = useCartActions();
  const [quantity, setQuantity] = useState(MIN_QUANTITY);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const increment = useCallback(() => setQuantity((q) => clampQuantity(q + 1)), []);
  const decrement = useCallback(() => setQuantity((q) => clampQuantity(q - 1)), []);

  const addToCart = useCallback(() => {
    add(item, quantity);
    setQuantity(MIN_QUANTITY);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), ADDED_FEEDBACK_MS);
  }, [add, item, quantity]);

  return {
    quantity,
    increment,
    decrement,
    canDecrement: quantity > MIN_QUANTITY,
    canIncrement: quantity < MAX_QUANTITY,
    add: addToCart,
    added,
  };
}
