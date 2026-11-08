"use client";

import { useEffect, type Dispatch } from "react";
import { CART_STORAGE_KEY, loadCart, saveCart } from "@/context/cart/cart.storage";
import type { CartAction } from "@/reducers/cartReducer";
import type { CartItem } from "@/types";

/**
 * Sincroniza el carrito con localStorage:
 * - Lee DESPUÉS de montar (en efecto) para que el HTML del servidor y el primer render del
 *   cliente coincidan (sin hydration mismatch).
 * - Escribe solo cuando ya se hidrató (si no, borraría lo guardado con el carrito vacío inicial).
 * - Escucha el evento `storage` para reflejar cambios hechos en otra pestaña.
 */
export function useCartPersistence(items: CartItem[], hydrated: boolean, dispatch: Dispatch<CartAction>) {
  useEffect(() => {
    dispatch({ type: "HYDRATE", items: loadCart() });

    function onStorage(e: StorageEvent) {
      if (e.key === CART_STORAGE_KEY || e.key === null) dispatch({ type: "HYDRATE", items: loadCart() });
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [dispatch]);

  useEffect(() => {
    if (hydrated) saveCart(items);
  }, [items, hydrated]);
}
