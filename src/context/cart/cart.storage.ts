import { z } from "zod";
import type { CartItem } from "@/types";

/**
 * Persistencia del carrito en localStorage. Clave versionada: si cambia la forma, sube a v2
 * y agrega una migración aquí. Solo se guardan los campos de CartItem (nada de datos personales).
 */
export const CART_STORAGE_KEY = "rakuun:cart:v1";

const cartItemSchema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  price: z.number().finite().nonnegative(),
  imageUrl: z.string().nullable(),
  quantity: z.number().int().positive(),
});

const storedCartSchema = z.object({
  version: z.literal(1),
  items: z.array(z.unknown()),
});

/** Interpreta lo guardado. Descarta líneas inválidas una por una; si el formato no sirve, carrito vacío. */
export function parseStoredCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return [];
  }
  const parsed = storedCartSchema.safeParse(json);
  if (!parsed.success) return [];
  const items: CartItem[] = [];
  const seen = new Set<string>();
  for (const candidate of parsed.data.items) {
    const item = cartItemSchema.safeParse(candidate);
    if (item.success && !seen.has(item.data.productId)) {
      seen.add(item.data.productId);
      items.push(item.data);
    }
  }
  return items;
}

export function serializeCart(items: CartItem[]): string {
  return JSON.stringify({
    version: 1,
    items: items.map(({ productId, slug, name, price, imageUrl, quantity }) => ({ productId, slug, name, price, imageUrl, quantity })),
  });
}

/** Lee el carrito. Nunca lanza (modo privado, almacenamiento bloqueado, JSON roto). */
export function loadCart(storage: Pick<Storage, "getItem"> | undefined = globalThis.localStorage): CartItem[] {
  try {
    return parseStoredCart(storage?.getItem(CART_STORAGE_KEY) ?? null);
  } catch {
    return [];
  }
}

/** Guarda el carrito. Nunca lanza (cuota excedida, modo privado). */
export function saveCart(items: CartItem[], storage: Pick<Storage, "setItem" | "removeItem"> | undefined = globalThis.localStorage): void {
  try {
    if (!storage) return;
    if (items.length === 0) storage.removeItem(CART_STORAGE_KEY);
    else storage.setItem(CART_STORAGE_KEY, serializeCart(items));
  } catch {
    // Sin almacenamiento disponible: el carrito sigue funcionando en memoria.
  }
}
