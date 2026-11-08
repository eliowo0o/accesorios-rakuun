import type { AdminCategory, AdminProduct, CategoryData, ProductData, SettingsData } from "./types";

/**
 * Única capa de escritura/lectura del admin. Dos implementaciones:
 * - `repository.supabase.ts` (con la sesión del admin, vía RLS)
 * - `repository.mock.ts` (modo desarrollo: muta los arreglos de services/mock/data.ts)
 * Las lecturas incluyen ocultos y NO se cachean.
 * Las reglas de negocio lanzan `AdminRepoError` (ver rules.ts).
 */
export interface AdminRepository {
  listCategories(): Promise<AdminCategory[]>;
  getCategory(id: string): Promise<AdminCategory | null>;
  categorySlugExists(slug: string, excludeId?: string): Promise<boolean>;
  createCategory(data: CategoryData): Promise<AdminCategory>;
  updateCategory(id: string, data: CategoryData): Promise<AdminCategory>;
  /** Bloquea si tiene hijas o productos. Devuelve la imagen que tenía para borrarla del bucket. */
  deleteCategory(id: string): Promise<{ imageUrl: string | null }>;

  listProducts(): Promise<AdminProduct[]>;
  getProduct(id: string): Promise<AdminProduct | null>;
  productSlugExists(slug: string, excludeId?: string): Promise<boolean>;
  createProduct(data: ProductData): Promise<AdminProduct>;
  /** Reemplaza imágenes y categorías por las de `data`. */
  updateProduct(id: string, data: ProductData): Promise<AdminProduct>;
  /** Borra el producto y sus filas de imágenes; devuelve las URLs para borrar los archivos. */
  deleteProduct(id: string): Promise<{ imageUrls: string[] }>;

  getSettings(): Promise<SettingsData>;
  updateSettings(data: SettingsData): Promise<SettingsData>;
}
