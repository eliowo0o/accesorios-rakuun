"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CACHE_TAGS } from "@/services/catalog";
import { fromError, invalid, uniqueSlugFrom } from "../action-helpers";
import { requireAdmin } from "../auth";
import { ADMIN_ROUTES } from "../config";
import { getAdminRepository } from "../data";
import { removedUrls } from "../rules";
import { idSchema, parseProductForm } from "../schemas";
import { deleteStoredImages } from "../storage";
import type { ActionResult, ActionState } from "../types";

/**
 * Crea (sin `id`) o edita (con `id`) un producto con sus imágenes ordenadas y subcategorías.
 * Al crear redirige a la pantalla de edición. Las imágenes quitadas se borran del bucket.
 */
export async function saveProduct(_prev: ActionState, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const rawId = formData.get("id");
  const id = rawId ? idSchema.safeParse(rawId) : null;
  if (id && !id.success) return { ok: false, error: "Producto inválido." };

  const parsed = parseProductForm(formData);
  if (!parsed.success) return invalid(parsed.error);

  const repo = getAdminRepository();
  let createdId: string | null = null;
  try {
    const productId = id?.data;
    const previous = productId ? await repo.getProduct(productId) : null;
    if (productId && !previous) return { ok: false, error: "El producto ya no existe." };

    const slug = await uniqueSlugFrom(parsed.data.slug, parsed.data.name, (s) => repo.productSlugExists(s, productId));
    const data = {
      ...parsed.data,
      slug,
      images: parsed.data.images.map((img) => ({ url: img.url, alt: img.alt || parsed.data.name })),
    };

    if (productId) {
      await repo.updateProduct(productId, data);
    } else {
      createdId = (await repo.createProduct(data)).id;
    }

    updateTag(CACHE_TAGS.products);
    await deleteStoredImages(
      removedUrls(
        previous?.images.map((i) => i.url) ?? [],
        data.images.map((i) => i.url),
      ),
    );
  } catch (error) {
    return fromError(error);
  }

  if (createdId) redirect(`${ADMIN_ROUTES.product(createdId)}?creado=1`);
  return { ok: true, message: "Producto guardado." };
}

/** Borra el producto, sus filas de imágenes y los archivos en S3. */
export async function deleteProduct(productId: string): Promise<ActionResult> {
  await requireAdmin();
  const id = idSchema.safeParse(productId);
  if (!id.success) return { ok: false, error: "Producto inválido." };

  try {
    const { imageUrls } = await getAdminRepository().deleteProduct(id.data);
    updateTag(CACHE_TAGS.products);
    await deleteStoredImages(imageUrls);
  } catch (error) {
    return fromError(error);
  }
  redirect(ADMIN_ROUTES.products);
}
