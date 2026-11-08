import type { CartItem, UUID } from "@/types";

/**
 * Reducer puro del carrito. Sin efectos: la persistencia (localStorage) y la sincronización
 * con el servidor viven en hooks (useCartPersistence / useCartSync).
 */

export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 99;

/** Datos actuales de un producto según el servidor (respuesta de syncCartProducts). */
export interface CartProductSnapshot {
  productId: UUID;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  isSoldOut: boolean;
}

/** Aviso que se muestra al abrir el carrito si algo cambió desde que se agregó. */
export type CartNotice =
  | { kind: "removed"; productId: UUID; name: string }
  | { kind: "soldOut"; productId: UUID; name: string }
  | { kind: "priceChanged"; productId: UUID; name: string; oldPrice: number; newPrice: number };

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  /** true cuando ya se leyó localStorage (tras montar). Antes, no se escribe nada. */
  hydrated: boolean;
  notices: CartNotice[];
}

export type CartAction =
  | { type: "ADD"; item: Omit<CartItem, "quantity">; quantity?: number }
  | { type: "REMOVE"; productId: UUID }
  | { type: "SET_QUANTITY"; productId: UUID; quantity: number }
  | { type: "CLEAR" }
  /**
   * Carga lo guardado. La primera vez (hydrated=false) se mezcla con lo que haya en memoria
   * (por si el usuario agregó algo antes de hidratar); después (otra pestaña cambió el
   * carrito) reemplaza.
   */
  | { type: "HYDRATE"; items: CartItem[] }
  /**
   * Aplica los datos actuales del servidor. `requestedIds` son los ids consultados: solo esos
   * se pueden marcar como quitados (un producto agregado mientras la petición viajaba se respeta).
   */
  | { type: "SYNC_PRODUCTS"; requestedIds: UUID[]; products: CartProductSnapshot[] }
  | { type: "DISMISS_NOTICES" }
  | { type: "OPEN" }
  | { type: "CLOSE" };

export const initialCartState: CartState = {
  items: [],
  isOpen: false,
  hydrated: false,
  notices: [],
};

export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return MIN_QUANTITY;
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.trunc(quantity)));
}

function mergeItems(base: CartItem[], extra: CartItem[]): CartItem[] {
  const result = base.map((i) => ({ ...i, quantity: clampQuantity(i.quantity) }));
  for (const item of extra) {
    const index = result.findIndex((i) => i.productId === item.productId);
    if (index === -1) result.push({ ...item, quantity: clampQuantity(item.quantity) });
    else result[index] = { ...item, quantity: clampQuantity(result[index].quantity + item.quantity) };
  }
  return result;
}

function syncProducts(state: CartState, requestedIds: UUID[], products: CartProductSnapshot[]): CartState {
  const requested = new Set(requestedIds);
  const byId = new Map(products.map((p) => [p.productId, p]));
  const notices: CartNotice[] = [];
  const items: CartItem[] = [];
  let changed = false;

  for (const item of state.items) {
    if (!requested.has(item.productId)) {
      items.push(item);
      continue;
    }
    const current = byId.get(item.productId);
    if (!current) {
      notices.push({ kind: "removed", productId: item.productId, name: item.name });
      changed = true;
      continue;
    }
    if (current.isSoldOut) {
      notices.push({ kind: "soldOut", productId: item.productId, name: current.name });
      changed = true;
      continue;
    }
    if (current.price !== item.price) {
      notices.push({ kind: "priceChanged", productId: item.productId, name: current.name, oldPrice: item.price, newPrice: current.price });
    }
    const next: CartItem = {
      productId: item.productId,
      slug: current.slug,
      name: current.name,
      price: current.price,
      imageUrl: current.imageUrl,
      quantity: item.quantity,
    };
    if (next.slug !== item.slug || next.name !== item.name || next.price !== item.price || next.imageUrl !== item.imageUrl) {
      changed = true;
      items.push(next);
    } else {
      items.push(item);
    }
  }

  if (!changed && notices.length === 0) return state;
  return { ...state, items: changed ? items : state.items, notices: [...state.notices, ...notices] };
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const quantity = clampQuantity(action.quantity ?? 1);
      const existing = state.items.find((i) => i.productId === action.item.productId);
      if (!existing) return { ...state, items: [...state.items, { ...action.item, quantity }] };
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.item.productId ? { ...i, ...action.item, quantity: clampQuantity(i.quantity + quantity) } : i,
        ),
      };
    }
    case "REMOVE": {
      if (!state.items.some((i) => i.productId === action.productId)) return state;
      return { ...state, items: state.items.filter((i) => i.productId !== action.productId) };
    }
    case "SET_QUANTITY": {
      const quantity = clampQuantity(action.quantity);
      const existing = state.items.find((i) => i.productId === action.productId);
      if (!existing || existing.quantity === quantity) return state;
      return { ...state, items: state.items.map((i) => (i.productId === action.productId ? { ...i, quantity } : i)) };
    }
    case "CLEAR":
      return state.items.length === 0 && state.notices.length === 0 ? state : { ...state, items: [], notices: [] };
    case "HYDRATE":
      return {
        ...state,
        hydrated: true,
        items: state.hydrated ? mergeItems([], action.items) : mergeItems(action.items, state.items),
      };
    case "SYNC_PRODUCTS":
      return syncProducts(state, action.requestedIds, action.products);
    case "DISMISS_NOTICES":
      return state.notices.length === 0 ? state : { ...state, notices: [] };
    case "OPEN":
      return state.isOpen ? state : { ...state, isOpen: true };
    case "CLOSE":
      return state.isOpen ? { ...state, isOpen: false } : state;
    default:
      return state;
  }
}

/** Suma de cantidades. */
export function selectCount(items: CartItem[]): number {
  return items.reduce((n, i) => n + i.quantity, 0);
}

/** Suma de precio × cantidad (redondeado a centavos). */
export function selectTotal(items: CartItem[]): number {
  return Math.round(items.reduce((n, i) => n + i.price * i.quantity, 0) * 100) / 100;
}
