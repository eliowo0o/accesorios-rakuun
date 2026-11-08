/**
 * Reglas de negocio puras del admin, compartidas por los repositorios Mock y Supabase.
 */
import type { AdminCategory, AdminCategoryNode, AdminProduct, AdminSummary, ProductFilters } from "./types";

export type AdminErrorCode =
  | "NOT_FOUND"
  | "CATEGORY_HAS_CHILDREN"
  | "CATEGORY_HAS_PRODUCTS"
  | "INVALID_PARENT"
  | "SLUG_TAKEN"
  | "UNKNOWN";

/** Error esperado (regla de negocio) con mensaje listo para mostrar al admin. */
export class AdminRepoError extends Error {
  constructor(
    public readonly code: AdminErrorCode,
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = "AdminRepoError";
  }
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * Máximo 2 niveles: el padre debe existir, ser raíz y no ser la propia categoría;
 * una categoría con subcategorías no puede volverse subcategoría.
 */
export function assertCategoryHierarchy(categories: AdminCategory[], id: string | null, parentId: string | null): void {
  if (!parentId) return;
  if (parentId === id) throw new AdminRepoError("INVALID_PARENT", "Una categoría no puede ser su propia categoría padre.", "parentId");
  const parent = categories.find((c) => c.id === parentId);
  if (!parent) throw new AdminRepoError("INVALID_PARENT", "La categoría padre no existe.", "parentId");
  if (parent.parentId !== null) {
    throw new AdminRepoError("INVALID_PARENT", "Solo hay 2 niveles: elige una categoría principal como padre.", "parentId");
  }
  if (id && categories.some((c) => c.parentId === id)) {
    throw new AdminRepoError("INVALID_PARENT", "Esta categoría tiene subcategorías, así que no puede ser subcategoría de otra.", "parentId");
  }
}

/** Bloquea el borrado si tiene hijas o productos asignados (nada de cascada silenciosa). */
export function assertCategoryDeletable(category: AdminCategory, childCount: number): void {
  if (childCount > 0) {
    throw new AdminRepoError(
      "CATEGORY_HAS_CHILDREN",
      `No se puede borrar «${category.name}»: tiene ${plural(childCount, "subcategoría", "subcategorías")}. Muévelas o bórralas primero.`,
    );
  }
  if (category.productCount > 0) {
    throw new AdminRepoError(
      "CATEGORY_HAS_PRODUCTS",
      `No se puede borrar «${category.name}»: tiene ${plural(category.productCount, "producto asignado", "productos asignados")}. Quítalos de la categoría primero.`,
    );
  }
}

/** "collar" → "collar", y si choca "collar-2", "collar-3"… */
export async function resolveUniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  if (!(await exists(base))) return base;
  for (let n = 2; n < 1000; n++) {
    const candidate = `${base}-${n}`;
    if (!(await exists(candidate))) return candidate;
  }
  throw new AdminRepoError("SLUG_TAKEN", "No se pudo generar un slug único.", "slug");
}

export function buildCategoryTree(categories: AdminCategory[]): AdminCategoryNode[] {
  const byOrder = (a: AdminCategory, b: AdminCategory) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "es");
  return categories
    .filter((c) => c.parentId === null)
    .sort(byOrder)
    .map((root) => ({ ...root, children: categories.filter((c) => c.parentId === root.id).sort(byOrder) }));
}

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function compareAdminProducts(a: AdminProduct, b: AdminProduct): number {
  return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "es");
}

/** Filtra la lista del admin. `categoryId` de una raíz incluye sus subcategorías. */
export function filterProducts(products: AdminProduct[], categories: AdminCategory[], filters: ProductFilters): AdminProduct[] {
  const q = filters.q ? normalize(filters.q.trim()) : "";
  const scope = filters.categoryId
    ? new Set([filters.categoryId, ...categories.filter((c) => c.parentId === filters.categoryId).map((c) => c.id)])
    : null;
  const matchFlag = (flag: "si" | "no" | undefined, value: boolean) => !flag || (flag === "si") === value;

  return products
    .filter((p) => !q || normalize(`${p.name} ${p.slug} ${p.description ?? ""}`).includes(q))
    .filter((p) => !scope || p.categoryIds.some((id) => scope.has(id)))
    .filter((p) => matchFlag(filters.visible, p.isVisible))
    .filter((p) => matchFlag(filters.soldOut, p.isSoldOut))
    .filter((p) => matchFlag(filters.featured, p.isFeatured))
    .sort(compareAdminProducts);
}

export function summarize(products: AdminProduct[], categories: AdminCategory[]): AdminSummary {
  return {
    products: products.length,
    hidden: products.filter((p) => !p.isVisible).length,
    soldOut: products.filter((p) => p.isSoldOut).length,
    featured: products.filter((p) => p.isFeatured).length,
    categories: categories.filter((c) => c.parentId === null).length,
    subcategories: categories.filter((c) => c.parentId !== null).length,
  };
}

/** URLs que estaban antes y ya no están (para borrar sus archivos). */
export function removedUrls(before: (string | null | undefined)[], after: (string | null | undefined)[]): string[] {
  const keep = new Set(after.filter(Boolean));
  return [...new Set(before.filter((u): u is string => !!u && !keep.has(u)))];
}
