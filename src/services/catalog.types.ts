import type { Category, CategoryWithChildren, Product, StoreSettings } from "@/types";

/**
 * CONTRATO de lectura del catálogo público. Solo devuelve elementos visibles.
 * Implementaciones: services/mock/repository.ts (datos de prueba) y la de Supabase (agente Datos).
 */
export interface CatalogRepository {
  getStoreSettings(): Promise<StoreSettings>;
  /** Categorías raíz con sus subcategorías, ordenadas por sortOrder. */
  getCategoryTree(): Promise<CategoryWithChildren[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  /** Productos de una categoría; si es raíz incluye los de sus subcategorías. Sin duplicados. */
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getAllProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  /** Por productos visibles cuyo nombre o descripción contiene el texto (sin acentos/mayúsculas). */
  searchProducts(query: string): Promise<Product[]>;
}

/** Orden de productos en la tienda: destacados primero, luego sortOrder, luego nombre. */
export function compareProducts(a: Product, b: Product): number {
  if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.name.localeCompare(b.name, "es");
}
