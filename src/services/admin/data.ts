import "server-only";
import { requireAdmin } from "./auth";
import { getAdminMode } from "./config";
import type { AdminRepository } from "./repository";
import { mockAdminRepository } from "./repository.mock";
import { createSupabaseAdminRepository } from "./repository.supabase";
import { buildCategoryTree, filterProducts, summarize } from "./rules";
import type { AdminCategory, AdminCategoryNode, AdminProduct, AdminSummary, ProductFilters, SettingsData } from "./types";

/** Elige la implementación según el entorno. Único punto que conoce Mock vs Supabase. */
export function getAdminRepository(): AdminRepository {
  const mode = getAdminMode();
  if (mode === "supabase") return createSupabaseAdminRepository();
  if (mode === "dev") return mockAdminRepository;
  throw new Error("Falta configurar Supabase.");
}

/*
 * Lecturas del admin para las páginas. Cada una verifica sesión (no se confía solo en el proxy)
 * y NO usa "use cache": incluyen ocultos y siempre están frescas.
 */

export async function getAdminSummary(): Promise<AdminSummary> {
  await requireAdmin();
  const repo = getAdminRepository();
  const [products, categories] = await Promise.all([repo.listProducts(), repo.listCategories()]);
  return summarize(products, categories);
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  await requireAdmin();
  return getAdminRepository().listCategories();
}

export async function getAdminCategoryTree(): Promise<AdminCategoryNode[]> {
  return buildCategoryTree(await getAdminCategories());
}

export async function getAdminProducts(filters: ProductFilters = {}): Promise<AdminProduct[]> {
  await requireAdmin();
  const repo = getAdminRepository();
  const [products, categories] = await Promise.all([repo.listProducts(), repo.listCategories()]);
  return filterProducts(products, categories, filters);
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  await requireAdmin();
  return getAdminRepository().getProduct(id);
}

export async function getAdminSettings(): Promise<SettingsData> {
  await requireAdmin();
  return getAdminRepository().getSettings();
}
