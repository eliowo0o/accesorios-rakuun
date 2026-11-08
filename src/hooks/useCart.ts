"use client";

import { useContext } from "react";
import { CartContext } from "@/context/cart/CartProvider";
import type { CartApi } from "@/context/cart/cart.types";

/** CONTRATO: punto de entrada único al carrito para cualquier componente. */
export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
