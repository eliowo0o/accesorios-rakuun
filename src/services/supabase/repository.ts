import "server-only";
import { getPublicSupabase, type PublicSupabaseClient } from "@/lib/supabase/public";
import type { CatalogRepository } from "../catalog.types";
import {
  buildCategoryTree,
  categoryScope,
  computeProductCounts,
  mapCategory,
  mapProducts,
  mapStoreSettings,
  toSearchPattern,
  type CategoryRecord,
  type ProductCategoryLink,
  withReachableParents,
  type ProductRecord,
} from "./mappers";

/**
 * CatalogRepository contra Supabase (rol anon + RLS). Solo devuelve lo visible:
 * RLS ya lo garantiza para anon, y además se filtra explícitamente en cada consulta.
 * Las categorías son pocas: se leen completas (1 viaje) y se usan para armar
 * CategoryRef, conteos y alcance; los productos traen imágenes y categorías embebidas.
 */

const CATEGORY_COLUMNS = "id, parent_id, name, slug, description, image_url, sort_order, is_visible";
// Literales (no concatenados) para que supabase-js infiera el tipo de cada fila.
const PRODUCT_COLUMNS =
  "id, name, slug, description, price, is_visible, is_sold_out, is_featured, sort_order, created_at, updated_at, product_images(id, url, alt, sort_order), product_categories(category_id)";
const PRODUCT_COLUMNS_IN_SCOPE = `${PRODUCT_COLUMNS}, scope:product_categories!inner(category_id)` as const;
const SETTINGS_COLUMNS =
  "store_name, tagline, hero_image_url, logo_url, whatsapp_number, instagram_url, location, payment_methods, delivery_options";

function fail(what: string, error: { message: string }): never {
  throw new Error(`Supabase (${what}): ${error.message}`);
}

export function createSupabaseCatalogRepository(db: PublicSupabaseClient): CatalogRepository {
  async function loadCategories(): Promise<CategoryRecord[]> {
    const { data, error } = await db
      .from("categories")
      .select(CATEGORY_COLUMNS)
      .eq("is_visible", true)
      .order("sort_order");
    if (error) fail("categorías", error);
    // Una subcategoría visible con padre oculto tampoco se muestra.
    return withReachableParents(data ?? []);
  }

  /** Vínculos producto-categoría solo de productos visibles (para los conteos). */
  async function loadVisibleLinks(): Promise<ProductCategoryLink[]> {
    const { data, error } = await db
      .from("product_categories")
      .select("product_id, category_id, products!inner(id)")
      .eq("products.is_visible", true);
    if (error) fail("conteos", error);
    return (data ?? []).map(({ product_id, category_id }) => ({ product_id, category_id }));
  }

  function productsQuery() {
    return db.from("products").select(PRODUCT_COLUMNS).eq("is_visible", true);
  }

  async function run(
    what: string,
    query: PromiseLike<{ data: ProductRecord[] | null; error: { message: string } | null }>,
  ): Promise<ProductRecord[]> {
    const { data, error } = await query;
    if (error) fail(what, error);
    return data ?? [];
  }

  return {
    async getStoreSettings() {
      const { data, error } = await db.from("store_settings").select(SETTINGS_COLUMNS).eq("id", 1).single();
      if (error) fail("ajustes", error);
      return mapStoreSettings(data);
    },

    async getCategoryTree() {
      const [categories, links] = await Promise.all([loadCategories(), loadVisibleLinks()]);
      return buildCategoryTree(categories, links);
    },

    async getCategoryBySlug(slug) {
      const [categories, links] = await Promise.all([loadCategories(), loadVisibleLinks()]);
      const row = categories.find((c) => c.slug === slug);
      if (!row) return null;
      return mapCategory(row, computeProductCounts(categories, links).get(row.id) ?? 0);
    },

    async getProductsByCategory(categoryId) {
      const categories = await loadCategories();
      // Categoría oculta o inexistente: nada (y evita mandar un id inválido a Postgres).
      if (!categories.some((c) => c.id === categoryId)) return [];
      const scope = [...categoryScope(categoryId, categories)];
      // "scope" es un segundo embed de product_categories con !inner que filtra
      // los productos sin recortar el embed product_categories que se mapea.
      const rows = await run(
        "productos por categoría",
        db
          .from("products")
          .select(PRODUCT_COLUMNS_IN_SCOPE)
          .eq("is_visible", true)
          .in("scope.category_id", scope),
      );
      return mapProducts(rows, categories);
    },

    async getAllProducts() {
      const [categories, rows] = await Promise.all([loadCategories(), run("productos", productsQuery())]);
      return mapProducts(rows, categories);
    },

    async getProductCount() {
      const { count, error } = await db
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("is_visible", true);
      if (error) fail("conteo de productos", error);
      return count ?? 0;
    },

    async getFeaturedProducts() {
      const [categories, rows] = await Promise.all([
        loadCategories(),
        run("destacados", productsQuery().eq("is_featured", true)),
      ]);
      return mapProducts(rows, categories);
    },

    async getProductBySlug(slug) {
      const [categories, rows] = await Promise.all([
        loadCategories(),
        run("producto", productsQuery().eq("slug", slug).limit(1)),
      ]);
      return mapProducts(rows, categories)[0] ?? null;
    },

    async searchProducts(query) {
      const pattern = toSearchPattern(query);
      if (!pattern) return [];
      // search_text = lower(unaccent(name + description)), columna generada en la BD.
      const [categories, rows] = await Promise.all([
        loadCategories(),
        run("búsqueda", productsQuery().ilike("search_text", pattern)),
      ]);
      return mapProducts(rows, categories);
    },
  };
}

let instance: CatalogRepository | null = null;

/** Repositorio con el cliente público (anon, sin cookies). Se crea una sola vez. */
export function getSupabaseRepository(): CatalogRepository {
  instance ??= createSupabaseCatalogRepository(getPublicSupabase());
  return instance;
}
