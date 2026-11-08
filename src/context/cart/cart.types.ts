import type { CartItem, UUID } from "@/types";

/**
 * CONTRATO del carrito. La Tienda solo usa `useCart()` con esta forma.
 * El agente Carrito puede agregar campos, pero no quitar ni renombrar los existentes.
 */
export interface CartApi {
  items: CartItem[];
  /** Suma de cantidades. */
  count: number;
  /** Suma de precio × cantidad, en MXN. */
  total: number;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (productId: UUID) => void;
  setQuantity: (productId: UUID, quantity: number) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}
