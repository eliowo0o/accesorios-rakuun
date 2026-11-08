import type { Category, CategoryRef, CategoryWithChildren, Product } from "@/types";
import { compareProducts, type CatalogRepository } from "../catalog.types";
import { mockCategories, mockProducts, mockSettings, type MockProduct } from "./data";

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Visibles y, si son subcategorías, con padre visible (una hija de un padre oculto no tiene URL). */
const visibleCategories = () => {
  const visibleIds = new Set(mockCategories.filter((c) => c.isVisible).map((c) => c.id));
  return mockCategories.filter((c) => c.isVisible && (c.parentId === null || visibleIds.has(c.parentId)));
};
const visibleProducts = () => mockProducts.filter((p) => p.isVisible);

function toCategoryRef(id: string): CategoryRef | null {
  const cats = visibleCategories();
  const cat = cats.find((c) => c.id === id);
  if (!cat) return null;
  const parent = cat.parentId ? cats.find((c) => c.id === cat.parentId) : null;
  return { id: cat.id, name: cat.name, slug: cat.slug, parentSlug: parent?.slug ?? null };
}

function toProduct(p: MockProduct): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    isVisible: p.isVisible,
    isSoldOut: p.isSoldOut,
    isFeatured: p.isFeatured,
    sortOrder: p.sortOrder,
    images: [...p.images].sort((a, b) => a.sortOrder - b.sortOrder),
    categories: p.categoryIds.map(toCategoryRef).filter((c): c is CategoryRef => c !== null),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

/** ids de la categoría + sus hijas visibles; vacío si la categoría no es visible. */
function categoryScope(categoryId: string): Set<string> {
  const cats = visibleCategories();
  if (!cats.some((c) => c.id === categoryId)) return new Set();
  return new Set([categoryId, ...cats.filter((c) => c.parentId === categoryId).map((c) => c.id)]);
}

function countFor(categoryId: string): number {
  const scope = categoryScope(categoryId);
  return visibleProducts().filter((p) => p.categoryIds.some((id) => scope.has(id))).length;
}

function toCategory(c: (typeof mockCategories)[number]): Category {
  return { ...c, productCount: countFor(c.id) };
}

export const mockRepository: CatalogRepository = {
  async getStoreSettings() {
    return { ...mockSettings };
  },

  async getCategoryTree(): Promise<CategoryWithChildren[]> {
    const cats = visibleCategories();
    return cats
      .filter((c) => c.parentId === null)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((root) => ({
        ...toCategory(root),
        children: cats
          .filter((c) => c.parentId === root.id)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(toCategory),
      }));
  },

  async getCategoryBySlug(slug) {
    const cat = visibleCategories().find((c) => c.slug === slug);
    return cat ? toCategory(cat) : null;
  },

  async getProductsByCategory(categoryId) {
    const scope = categoryScope(categoryId);
    return visibleProducts()
      .filter((p) => p.categoryIds.some((id) => scope.has(id)))
      .map(toProduct)
      .sort(compareProducts);
  },

  async getAllProducts() {
    return visibleProducts().map(toProduct).sort(compareProducts);
  },

  async getProductCount() {
    return visibleProducts().length;
  },

  async getFeaturedProducts() {
    return visibleProducts().filter((p) => p.isFeatured).map(toProduct).sort(compareProducts);
  },

  async getProductBySlug(slug) {
    const prod = visibleProducts().find((p) => p.slug === slug);
    return prod ? toProduct(prod) : null;
  },

  async searchProducts(query) {
    const q = normalize(query.trim());
    if (!q) return [];
    return visibleProducts()
      .filter((p) => normalize(`${p.name} ${p.description ?? ""}`).includes(q))
      .map(toProduct)
      .sort(compareProducts);
  },
};
