"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/services/catalog";
import { fromError, invalid, uniqueSlugFrom } from "../action-helpers";
import { requireAdmin } from "../auth";
import { getAdminRepository } from "../data";
import { removedUrls } from "../rules";
import { idSchema, parseCategoryForm } from "../schemas";
import { deleteStoredImages } from "../storage";
import type { ActionResult, ActionState } from "../types";

/** Crea (sin `id`) o edita (con `id` en el form) una categoría o subcategoría. */
export async function saveCategory(_prev: ActionState, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const rawId = formData.get("id");
  const id = rawId ? idSchema.safeParse(rawId) : null;
  if (id && !id.success) return { ok: false, error: "Categoría inválida." };

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) return invalid(parsed.error);

  const repo = getAdminRepository();
  try {
    const categoryId = id?.data;
    const previous = categoryId ? await repo.getCategory(categoryId) : null;
    if (categoryId && !previous) return { ok: false, error: "La categoría ya no existe." };

    const slug = await uniqueSlugFrom(parsed.data.slug, parsed.data.name, (s) => repo.categorySlugExists(s, categoryId));
    const data = { ...parsed.data, slug };

    if (categoryId) await repo.updateCategory(categoryId, data);
    else await repo.createCategory(data);

    updateTag(CACHE_TAGS.categories);
    await deleteStoredImages(removedUrls([previous?.imageUrl], [data.imageUrl]));
    return { ok: true, message: categoryId ? "Categoría actualizada." : "Categoría creada." };
  } catch (error) {
    return fromError(error);
  }
}

/** Bloqueado si tiene subcategorías o productos (mensaje claro, sin cascada). */
export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  await requireAdmin();
  const id = idSchema.safeParse(categoryId);
  if (!id.success) return { ok: false, error: "Categoría inválida." };

  try {
    const { imageUrl } = await getAdminRepository().deleteCategory(id.data);
    updateTag(CACHE_TAGS.categories);
    await deleteStoredImages(imageUrl ? [imageUrl] : []);
    return { ok: true, message: "Categoría borrada." };
  } catch (error) {
    return fromError(error);
  }
}
