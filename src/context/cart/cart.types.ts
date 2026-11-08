import type { CartItem, UUID } from "@/types";
import type { CartNotice } from "@/reducers/cartReducer";

export type { CartNotice };

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
  /** true cuando ya se leyó localStorage. Antes de eso `count` es 0 (igual que en el servidor). */
  hydrated: boolean;
  /** Productos que cambiaron de precio o se quitaron al sincronizar con el servidor. */
  notices: CartNotice[];
  dismissNotices: () => void;
}

/** Estado del carrito (cambia con cada acción). */
export type CartStateValue = Pick<CartApi, "items" | "count" | "total" | "isOpen" | "hydrated" | "notices">;

/** Acciones del carrito (referencias estables: no provocan renders). */
export type CartActions = Pick<CartApi, "add" | "remove" | "setQuantity" | "clear" | "open" | "close" | "dismissNotices">;
