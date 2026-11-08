"use client";

import { useEffect, useRef, type Dispatch } from "react";
import { syncCartProducts } from "@/services/cart-actions";
import type { CartAction } from "@/reducers/cartReducer";
import type { CartItem } from "@/types";

/**
 * Al abrir el carrito pide al servidor los datos actuales de sus productos (precio, nombre,
 * imagen, agotado) para que el mensaje de WhatsApp lleve precios vigentes y avisar si algo se quitó.
 * Una petición por apertura; si falla, el carrito sigue con lo que tenía.
 */
export function useCartSync(isOpen: boolean, hydrated: boolean, items: CartItem[], dispatch: Dispatch<CartAction>) {
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (!isOpen || !hydrated) return;
    const requestedIds = itemsRef.current.map((i) => i.productId);
    if (requestedIds.length === 0) return;

    let cancelled = false;
    syncCartProducts(requestedIds)
      .then((products) => {
        if (!cancelled) dispatch({ type: "SYNC_PRODUCTS", requestedIds, products });
      })
      .catch(() => {
        // Sin red o error del servidor: se conservan los datos guardados.
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, hydrated, dispatch]);
}
