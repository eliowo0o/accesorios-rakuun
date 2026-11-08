import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { CatalogRepository } from "./catalog.types";
import { mockRepository } from "./mock/repository";

/**
 * Lecturas públicas del catálogo, cacheadas.
 * CONTRATO para páginas y componentes: usar SOLO estas funciones (nunca Supabase directo).
 * Las Server Actions del admin invalidan con updateTag/revalidateTag usando CACHE_TAGS.
 */
export const CACHE_TAGS = {
  settings: "settings",
  categories: "categories",
  products: "products",
} as const;

/** El agente Datos cambia esto para usar Supabase cuando existan las env vars. */
function repo(): CatalogRepository {
  return mockRepository;
}

export async function getStoreSettings() {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.settings);
  return repo().getStoreSettings();
}

export async function getCategoryTree() {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.categories, CACHE_TAGS.products);
  return repo().getCategoryTree();
}

export async function getCategoryBySlug(slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.categories, CACHE_TAGS.products);
  return repo().getCategoryBySlug(slug);
}

export async function getProductsByCategory(categoryId: string) {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.products, CACHE_TAGS.categories);
  return repo().getProductsByCategory(categoryId);
}

export async function getAllProducts() {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.products, CACHE_TAGS.categories);
  return repo().getAllProducts();
}

export async function getFeaturedProducts() {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.products, CACHE_TAGS.categories);
  return repo().getFeaturedProducts();
}

export async function getProductBySlug(slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.products, CACHE_TAGS.categories);
  return repo().getProductBySlug(slug);
}

export async function searchProducts(query: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.products, CACHE_TAGS.categories);
  return repo().searchProducts(query);
}
