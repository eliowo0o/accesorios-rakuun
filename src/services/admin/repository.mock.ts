import { mockCategories, mockProducts, mockSettings, type MockCategory, type MockProduct } from "@/services/mock/data";
import type { StoreSettings } from "@/types";
import type { AdminRepository } from "./repository";
import { AdminRepoError, assertCategoryDeletable, assertCategoryHierarchy } from "./rules";
import type { AdminCategory, AdminProduct, ProductData } from "./types";

/**
 * Repositorio en memoria (modo desarrollo sin Supabase). Muta los arreglos que recibe;
 * la instancia por defecto usa los de services/mock/data.ts, así la tienda mock refleja los cambios
 * (las Server Actions llaman updateTag para que el "use cache" del catálogo se refresque).
 */
export interface MockStore {
  categories: MockCategory[];
  products: MockProduct[];
  settings: StoreSettings;
}

const uuid = () => crypto.randomUUID();
const clone = <T>(v: T): T => structuredClone(v);

export function createMockAdminRepository(store: MockStore): AdminRepository {
  const directCount = (categoryId: string) => store.products.filter((p) => p.categoryIds.includes(categoryId)).length;

  const toAdminCategory = (c: MockCategory): AdminCategory => ({ ...c, productCount: directCount(c.id) });

  const toAdminProduct = (p: MockProduct): AdminProduct => ({
    ...clone(p),
    images: [...p.images].sort((a, b) => a.sortOrder - b.sortOrder).map((i) => ({ ...i })),
  });

  const listCategories = async () => store.categories.map(toAdminCategory);

  const findCategory = (id: string) => {
    const found = store.categories.find((c) => c.id === id);
    if (!found) throw new AdminRepoError("NOT_FOUND", "La categoría ya no existe.");
    return found;
  };

  const findProduct = (id: string) => {
    const found = store.products.find((p) => p.id === id);
    if (!found) throw new AdminRepoError("NOT_FOUND", "El producto ya no existe.");
    return found;
  };

  const assertSlugFree = (taken: boolean) => {
    if (taken) throw new AdminRepoError("SLUG_TAKEN", "Ese slug ya está en uso.", "slug");
  };

  const assertCategoriesExist = (ids: string[]) => {
    if (ids.some((id) => !store.categories.some((c) => c.id === id))) {
      throw new AdminRepoError("NOT_FOUND", "Alguna de las categorías elegidas ya no existe.", "categoryIds");
    }
  };

  const buildImages = (previous: MockProduct["images"], data: ProductData) =>
    data.images.map((img, index) => ({
      id: previous.find((p) => p.url === img.url)?.id ?? uuid(),
      url: img.url,
      alt: img.alt,
      sortOrder: index + 1,
    }));

  const repo: AdminRepository = {
    listCategories,

    async getCategory(id) {
      const c = store.categories.find((x) => x.id === id);
      return c ? toAdminCategory(c) : null;
    },

    async categorySlugExists(slug, excludeId) {
      return store.categories.some((c) => c.slug === slug && c.id !== excludeId);
    },

    async createCategory(data) {
      assertCategoryHierarchy(await listCategories(), null, data.parentId);
      assertSlugFree(await repo.categorySlugExists(data.slug));
      const created: MockCategory = { id: uuid(), ...data };
      store.categories.push(created);
      return toAdminCategory(created);
    },

    async updateCategory(id, data) {
      const current = findCategory(id);
      assertCategoryHierarchy(await listCategories(), id, data.parentId);
      assertSlugFree(await repo.categorySlugExists(data.slug, id));
      Object.assign(current, data);
      return toAdminCategory(current);
    },

    async deleteCategory(id) {
      const current = findCategory(id);
      const childCount = store.categories.filter((c) => c.parentId === id).length;
      assertCategoryDeletable(toAdminCategory(current), childCount);
      store.categories.splice(store.categories.indexOf(current), 1);
      return { imageUrl: current.imageUrl };
    },

    async listProducts() {
      return store.products.map(toAdminProduct);
    },

    async getProduct(id) {
      const p = store.products.find((x) => x.id === id);
      return p ? toAdminProduct(p) : null;
    },

    async productSlugExists(slug, excludeId) {
      return store.products.some((p) => p.slug === slug && p.id !== excludeId);
    },

    async createProduct(data) {
      assertSlugFree(await repo.productSlugExists(data.slug));
      assertCategoriesExist(data.categoryIds);
      const now = new Date().toISOString();
      const { images: _images, ...fields } = data;
      void _images;
      const created: MockProduct = {
        id: uuid(),
        ...fields,
        categoryIds: [...new Set(data.categoryIds)],
        images: buildImages([], data),
        createdAt: now,
        updatedAt: now,
      };
      store.products.push(created);
      return toAdminProduct(created);
    },

    async updateProduct(id, data) {
      const current = findProduct(id);
      assertSlugFree(await repo.productSlugExists(data.slug, id));
      assertCategoriesExist(data.categoryIds);
      const { images: _images, ...fields } = data;
      void _images;
      Object.assign(current, fields, {
        categoryIds: [...new Set(data.categoryIds)],
        images: buildImages(current.images, data),
        updatedAt: new Date().toISOString(),
      });
      return toAdminProduct(current);
    },

    async deleteProduct(id) {
      const current = findProduct(id);
      store.products.splice(store.products.indexOf(current), 1);
      return { imageUrls: current.images.map((i) => i.url) };
    },

    async getSettings() {
      return clone(store.settings);
    },

    async updateSettings(data) {
      Object.assign(store.settings, clone(data));
      return clone(store.settings);
    },
  };

  return repo;
}

export const mockAdminRepository = createMockAdminRepository({
  categories: mockCategories,
  products: mockProducts,
  settings: mockSettings,
});
