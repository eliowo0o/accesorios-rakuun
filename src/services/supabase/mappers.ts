/**
 * Funciones puras de mapeo snake_case (BD) -> camelCase (dominio).
 * Sin I/O: se prueban en mappers.test.ts.
 */
import type {
  Category,
  CategoryRef,
  CategoryWithChildren,
  Product,
  ProductImage,
  StoreSettings,
} from "@/types";
import type { CategoryRow, ProductImageRow, ProductRow, StoreSettingsRow } from "@/types/database";
import { compareProducts } from "../catalog.types";

/** Columnas de categoría que pide el repositorio. */
export type CategoryRecord = Pick<
  CategoryRow,
  "id" | "parent_id" | "name" | "slug" | "description" | "image_url" | "sort_order" | "is_visible"
>;

/** Producto con relaciones embebidas tal como lo devuelve el select del repositorio. */
export type ProductRecord = Omit<ProductRow, "search_text"> & {
  product_images: Pick<ProductImageRow, "id" | "url" | "alt" | "sort_order">[] | null;
  product_categories: { category_id: string }[] | null;
};

/** Vínculo producto-categoría (solo de productos visibles). */
export interface ProductCategoryLink {
  product_id: string;
  category_id: string;
}

export type StoreSettingsRecord = Omit<StoreSettingsRow, "id" | "updated_at">;

/** Minúsculas y sin acentos; igual que lower(unaccent(...)) en Postgres. */
export function normalizeSearch(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

/** Escapa los comodines de LIKE/ILIKE (`\`, `%`, `_`) para buscar el texto literal. */
export function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

/** Patrón ILIKE "contiene" a partir de lo que escribe el usuario; null si queda vacío. */
export function toSearchPattern(query: string): string | null {
  const q = normalizeSearch(query);
  return q ? `%${escapeLike(q)}%` : null;
}

export function mapStoreSettings(row: StoreSettingsRecord): StoreSettings {
  return {
    storeName: row.store_name,
    tagline: row.tagline,
    heroImageUrl: row.hero_image_url,
    logoUrl: row.logo_url,
    whatsappNumber: row.whatsapp_number,
    instagramUrl: row.instagram_url,
    location: row.location,
    paymentMethods: row.payment_methods ?? [],
    deliveryOptions: row.delivery_options ?? [],
  };
}

/** Ids de la categoría + sus hijas directas (solo hay 2 niveles). */
export function categoryScope(categoryId: string, categories: CategoryRecord[]): Set<string> {
  return new Set([categoryId, ...categories.filter((c) => c.parent_id === categoryId).map((c) => c.id)]);
}

/**
 * Productos visibles por categoría (incluye los de sus hijas), sin duplicados:
 * un producto en dos subcategorías de la misma raíz cuenta una vez en la raíz.
 */
export function computeProductCounts(
  categories: CategoryRecord[],
  links: ProductCategoryLink[],
): Map<string, number> {
  const parentOf = new Map(categories.map((c) => [c.id, c.parent_id]));
  const productsBy = new Map<string, Set<string>>();
  const add = (categoryId: string, productId: string) => {
    let set = productsBy.get(categoryId);
    if (!set) productsBy.set(categoryId, (set = new Set()));
    set.add(productId);
  };
  for (const link of links) {
    if (!parentOf.has(link.category_id)) continue; // categoría oculta o inexistente
    add(link.category_id, link.product_id);
    const parentId = parentOf.get(link.category_id);
    if (parentId) add(parentId, link.product_id);
  }
  return new Map(categories.map((c) => [c.id, productsBy.get(c.id)?.size ?? 0]));
}

export function mapCategory(row: CategoryRecord, productCount: number): Category {
  return {
    id: row.id,
    parentId: row.parent_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
    isVisible: row.is_visible,
    productCount,
  };
}

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order;

/** Árbol raíz -> hijas, ordenado por sort_order (luego nombre para que sea estable). */
export function buildCategoryTree(
  categories: CategoryRecord[],
  links: ProductCategoryLink[],
): CategoryWithChildren[] {
  const counts = computeProductCounts(categories, links);
  const sorted = [...categories].sort((a, b) => bySortOrder(a, b) || a.name.localeCompare(b.name, "es"));
  return sorted
    .filter((c) => c.parent_id === null)
    .map((root) => ({
      ...mapCategory(root, counts.get(root.id) ?? 0),
      children: sorted
        .filter((c) => c.parent_id === root.id)
        .map((child) => mapCategory(child, counts.get(child.id) ?? 0)),
    }));
}

/**
 * Quita las subcategorías cuyo padre no está en la lista (oculto): sin padre
 * visible no tienen URL `/categoria/padre/hija` y generarían links 404.
 */
export function withReachableParents(categories: CategoryRecord[]): CategoryRecord[] {
  const ids = new Set(categories.map((c) => c.id));
  return categories.filter((c) => c.parent_id === null || ids.has(c.parent_id));
}

/** null si la categoría no está en el mapa o si su padre no lo está (padre oculto). */
export function toCategoryRef(
  categoryId: string,
  categoriesById: Map<string, CategoryRecord>,
): CategoryRef | null {
  const cat = categoriesById.get(categoryId);
  if (!cat) return null;
  if (cat.parent_id === null) return { id: cat.id, name: cat.name, slug: cat.slug, parentSlug: null };
  const parent = categoriesById.get(cat.parent_id);
  if (!parent) return null;
  return { id: cat.id, name: cat.name, slug: cat.slug, parentSlug: parent.slug };
}

export function mapProductImage(row: Pick<ProductImageRow, "id" | "url" | "alt" | "sort_order">): ProductImage {
  return { id: row.id, url: row.url, alt: row.alt, sortOrder: row.sort_order };
}

export function mapProduct(row: ProductRecord, categoriesById: Map<string, CategoryRecord>): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    // numeric llega como number en JSON, pero se fuerza por si llega como string.
    price: Number(row.price),
    isVisible: row.is_visible,
    isSoldOut: row.is_sold_out,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
    images: [...(row.product_images ?? [])].sort(bySortOrder).map(mapProductImage),
    categories: (row.product_categories ?? [])
      .map((pc) => toCategoryRef(pc.category_id, categoriesById))
      .filter((c): c is CategoryRef => c !== null),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Mapea, filtra los no visibles (defensa extra además de RLS) y ordena para la tienda. */
export function mapProducts(rows: ProductRecord[], categories: CategoryRecord[]): Product[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  return rows
    .filter((r) => r.is_visible)
    .map((r) => mapProduct(r, byId))
    .sort(compareProducts);
}
