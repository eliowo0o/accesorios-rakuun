"use server";

import { z } from "zod";
import { getAllProducts } from "@/services/catalog";
import type { CartProductSnapshot } from "@/reducers/cartReducer";

const idsSchema = z.array(z.string().min(1).max(64)).max(100);

/**
 * Datos actuales (precio, nombre, imagen, agotado) de los productos del carrito.
 * Los que no vengan en la respuesta ya no existen o están ocultos: el carrito los quita.
 * Solo lectura del catálogo público (cacheado), no requiere sesión.
 */
export async function syncCartProducts(productIds: string[]): Promise<CartProductSnapshot[]> {
  const parsed = idsSchema.safeParse(productIds);
  if (!parsed.success) return [];
  const wanted = new Set(parsed.data);
  if (wanted.size === 0) return [];

  const products = await getAllProducts();
  return products
    .filter((p) => wanted.has(p.id))
    .map((p) => ({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      imageUrl: p.images[0]?.url ?? null,
      isSoldOut: p.isSoldOut,
    }));
}
