import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { CatalogRepository } from "./catalog.types";
import { mockRepository } from "./mock/repository";
import { hasSupabaseEnv } from "@/lib/supabase/public";
import { getSupabaseRepository } from "./supabase/repository";

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

/** Supabase si existen NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY; si no, datos de prueba. */
function repo(): CatalogRepository {
  return hasSupabaseEnv() ? getSupabaseRepository() : mockRepository;
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

/** Cantidad de productos visibles; mismos tags que getAllProducts. */
export async function getProductCount() {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.products, CACHE_TAGS.categories);
  return repo().getProductCount();
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
