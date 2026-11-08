import "server-only";
import type { PostgrestError } from "@supabase/supabase-js";
import { createClient, type AdminSupabaseClient } from "@/lib/supabase/server";
import type { CategoryRow, ProductImageRow, ProductRow, StoreSettingsRow } from "@/types/database";
import type { AdminRepository } from "./repository";
import { AdminRepoError, assertCategoryDeletable, assertCategoryHierarchy } from "./rules";
import type { AdminCategory, AdminProduct, CategoryData, ProductData, SettingsData } from "./types";

/**
 * Repositorio Supabase con la sesión del admin (rol `authenticated`, protegido por RLS).
 * Nunca usa service_role. Sin "use cache": el admin siempre ve datos frescos (incluye ocultos).
 * Nota: supabase-js no tiene transacciones; las escrituras multi-tabla se hacen en secuencia.
 */

function fail(error: PostgrestError, context: string): never {
  if (error.code === "23505") throw new AdminRepoError("SLUG_TAKEN", "Ese slug ya está en uso.", "slug");
  if (error.code === "23503") throw new AdminRepoError("CATEGORY_HAS_PRODUCTS", "No se puede borrar: tiene elementos relacionados.");
  console.error(`[admin/supabase] ${context}`, error);
  throw new AdminRepoError("UNKNOWN", "No se pudo guardar en la base de datos. Intenta de nuevo.");
}

const toCategory = (row: CategoryRow, productCount: number): AdminCategory => ({
  id: row.id,
  parentId: row.parent_id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  imageUrl: row.image_url,
  sortOrder: row.sort_order,
  isVisible: row.is_visible,
  productCount,
});

const categoryRow = (d: CategoryData) => ({
  parent_id: d.parentId,
  name: d.name,
  slug: d.slug,
  description: d.description,
  image_url: d.imageUrl,
  sort_order: d.sortOrder,
  is_visible: d.isVisible,
});

const productRow = (d: ProductData) => ({
  name: d.name,
  slug: d.slug,
  description: d.description,
  price: d.price,
  is_visible: d.isVisible,
  is_sold_out: d.isSoldOut,
  is_featured: d.isFeatured,
  sort_order: d.sortOrder,
});

function toProduct(row: ProductRow, images: ProductImageRow[], categoryIds: string[]): AdminProduct {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    isVisible: row.is_visible,
    isSoldOut: row.is_sold_out,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
    images: images
      .filter((i) => i.product_id === row.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => ({ id: i.id, url: i.url, alt: i.alt, sortOrder: i.sort_order })),
    categoryIds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const toSettings = (row: StoreSettingsRow): SettingsData => ({
  storeName: row.store_name,
  tagline: row.tagline,
  heroImageUrl: row.hero_image_url,
  logoUrl: row.logo_url,
  whatsappNumber: row.whatsapp_number,
  instagramUrl: row.instagram_url,
  location: row.location,
  paymentMethods: row.payment_methods ?? [],
  deliveryOptions: row.delivery_options ?? [],
});

async function loadProducts(db: AdminSupabaseClient, onlyId?: string): Promise<AdminProduct[]> {
  let productsQuery = db.from("products").select("*");
  if (onlyId) productsQuery = productsQuery.eq("id", onlyId);
  const { data: rows, error } = await productsQuery;
  if (error) fail(error, "products.select");
  if (!rows.length) return [];

  const ids = rows.map((r) => r.id);
  const [imgs, links] = await Promise.all([
    db.from("product_images").select("*").in("product_id", ids),
    db.from("product_categories").select("*").in("product_id", ids),
  ]);
  if (imgs.error) fail(imgs.error, "product_images.select");
  if (links.error) fail(links.error, "product_categories.select");

  return rows.map((row) =>
    toProduct(
      row,
      imgs.data,
      links.data.filter((l) => l.product_id === row.id).map((l) => l.category_id),
    ),
  );
}

async function replaceRelations(db: AdminSupabaseClient, productId: string, data: ProductData, fallbackAlt: string) {
  const delImgs = await db.from("product_images").delete().eq("product_id", productId);
  if (delImgs.error) fail(delImgs.error, "product_images.delete");
  if (data.images.length) {
    const ins = await db.from("product_images").insert(
      data.images.map((img, index) => ({ product_id: productId, url: img.url, alt: img.alt || fallbackAlt, sort_order: index + 1 })),
    );
    if (ins.error) fail(ins.error, "product_images.insert");
  }

  const delLinks = await db.from("product_categories").delete().eq("product_id", productId);
  if (delLinks.error) fail(delLinks.error, "product_categories.delete");
  const categoryIds = [...new Set(data.categoryIds)];
  if (categoryIds.length) {
    const ins = await db.from("product_categories").insert(categoryIds.map((category_id) => ({ product_id: productId, category_id })));
    if (ins.error) fail(ins.error, "product_categories.insert");
  }
}

export function createSupabaseAdminRepository(): AdminRepository {
  const db = () => createClient();

  const listCategories = async (): Promise<AdminCategory[]> => {
    const client = await db();
    const [cats, links] = await Promise.all([
      client.from("categories").select("*"),
      client.from("product_categories").select("category_id"),
    ]);
    if (cats.error) fail(cats.error, "categories.select");
    if (links.error) fail(links.error, "product_categories.select");
    const counts = new Map<string, number>();
    links.data.forEach((l) => counts.set(l.category_id, (counts.get(l.category_id) ?? 0) + 1));
    return cats.data.map((row) => toCategory(row, counts.get(row.id) ?? 0));
  };

  const slugExists = async (table: "categories" | "products", slug: string, excludeId?: string) => {
    const client = await db();
    let query = client.from(table).select("id").eq("slug", slug);
    if (excludeId) query = query.neq("id", excludeId);
    const { data, error } = await query.limit(1);
    if (error) fail(error, `${table}.slugExists`);
    return data.length > 0;
  };

  const repo: AdminRepository = {
    listCategories,

    async getCategory(id) {
      return (await listCategories()).find((c) => c.id === id) ?? null;
    },

    categorySlugExists: (slug, excludeId) => slugExists("categories", slug, excludeId),

    async createCategory(data) {
      assertCategoryHierarchy(await listCategories(), null, data.parentId);
      const client = await db();
      const { data: row, error } = await client.from("categories").insert(categoryRow(data)).select("*").single();
      if (error) fail(error, "categories.insert");
      return toCategory(row, 0);
    },

    async updateCategory(id, data) {
      const all = await listCategories();
      const current = all.find((c) => c.id === id);
      if (!current) throw new AdminRepoError("NOT_FOUND", "La categoría ya no existe.");
      assertCategoryHierarchy(all, id, data.parentId);
      const client = await db();
      const { data: row, error } = await client.from("categories").update(categoryRow(data)).eq("id", id).select("*").single();
      if (error) fail(error, "categories.update");
      return toCategory(row, current.productCount);
    },

    async deleteCategory(id) {
      const all = await listCategories();
      const current = all.find((c) => c.id === id);
      if (!current) throw new AdminRepoError("NOT_FOUND", "La categoría ya no existe.");
      assertCategoryDeletable(current, all.filter((c) => c.parentId === id).length);
      const client = await db();
      const { error } = await client.from("categories").delete().eq("id", id);
      if (error) fail(error, "categories.delete");
      return { imageUrl: current.imageUrl };
    },

    async listProducts() {
      return loadProducts(await db());
    },

    async getProduct(id) {
      const [product] = await loadProducts(await db(), id);
      return product ?? null;
    },

    productSlugExists: (slug, excludeId) => slugExists("products", slug, excludeId),

    async createProduct(data) {
      const client = await db();
      const { data: row, error } = await client.from("products").insert(productRow(data)).select("*").single();
      if (error) fail(error, "products.insert");
      await replaceRelations(client, row.id, data, data.name);
      return (await repo.getProduct(row.id))!;
    },

    async updateProduct(id, data) {
      const client = await db();
      const { data: row, error } = await client.from("products").update(productRow(data)).eq("id", id).select("id").maybeSingle();
      if (error) fail(error, "products.update");
      if (!row) throw new AdminRepoError("NOT_FOUND", "El producto ya no existe.");
      await replaceRelations(client, id, data, data.name);
      return (await repo.getProduct(id))!;
    },

    async deleteProduct(id) {
      const current = await repo.getProduct(id);
      if (!current) throw new AdminRepoError("NOT_FOUND", "El producto ya no existe.");
      const client = await db();
      // product_images y product_categories caen por on delete cascade.
      const { error } = await client.from("products").delete().eq("id", id);
      if (error) fail(error, "products.delete");
      return { imageUrls: current.images.map((i) => i.url) };
    },

    async getSettings() {
      const client = await db();
      const { data, error } = await client.from("store_settings").select("*").eq("id", 1).maybeSingle();
      if (error) fail(error, "store_settings.select");
      if (!data) throw new AdminRepoError("NOT_FOUND", "No existe la fila de ajustes (store_settings id = 1). Corre el seed.");
      return toSettings(data);
    },

    async updateSettings(d) {
      const client = await db();
      const { data, error } = await client
        .from("store_settings")
        .upsert({
          id: 1,
          store_name: d.storeName,
          tagline: d.tagline,
          hero_image_url: d.heroImageUrl,
          logo_url: d.logoUrl,
          whatsapp_number: d.whatsappNumber,
          instagram_url: d.instagramUrl,
          location: d.location,
          payment_methods: d.paymentMethods,
          delivery_options: d.deliveryOptions,
        })
        .select("*")
        .single();
      if (error) fail(error, "store_settings.upsert");
      return toSettings(data);
    },
  };

  return repo;
}
