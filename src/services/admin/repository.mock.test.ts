import { beforeEach, describe, expect, it } from "vitest";
import { mockCategories, mockProducts, mockSettings } from "@/services/mock/data";
import { mockRepository } from "@/services/mock/repository";
import type { AdminRepository } from "./repository";
import { createMockAdminRepository, type MockStore } from "./repository.mock";
import { AdminRepoError, filterProducts, removedUrls, resolveUniqueSlug, summarize } from "./rules";
import type { CategoryData, ProductData } from "./types";

const COLLARES = "00000000-0000-4000-8000-000000000001";
const PERLAS = "00000000-0000-4000-8000-000000000011";
const LLAVEROS = "00000000-0000-4000-8000-000000000004";
const COLLAR = "10000000-0000-4000-8000-000000000001";

const category = (over: Partial<CategoryData> = {}): CategoryData => ({
  name: "Anillos",
  slug: "anillos",
  description: null,
  imageUrl: null,
  parentId: null,
  sortOrder: 7,
  isVisible: true,
  ...over,
});

const product = (over: Partial<ProductData> = {}): ProductData => ({
  name: "Anillo luna",
  slug: "anillo-luna",
  description: null,
  price: 80,
  isVisible: true,
  isSoldOut: false,
  isFeatured: false,
  sortOrder: 0,
  categoryIds: [PERLAS],
  images: [
    { url: "/uploads-dev/a.jpg", alt: "A" },
    { url: "/uploads-dev/b.jpg", alt: "B" },
  ],
  ...over,
});

const code = async (p: Promise<unknown>) => {
  try {
    await p;
  } catch (e) {
    if (e instanceof AdminRepoError) return e.code;
    throw e;
  }
  return "OK";
};

let store: MockStore;
let repo: AdminRepository;

beforeEach(() => {
  store = structuredClone({ categories: mockCategories, products: mockProducts, settings: mockSettings });
  repo = createMockAdminRepository(store);
});

describe("categorías", () => {
  it("lista incluye ocultas y cuenta productos directos (visibles u ocultos)", async () => {
    store.categories[0].isVisible = false;
    const cats = await repo.listCategories();
    expect(cats).toHaveLength(mockCategories.length);
    expect(cats.find((c) => c.id === PERLAS)?.productCount).toBe(1);
    expect(cats.find((c) => c.id === "00000000-0000-4000-8000-000000000061")?.productCount).toBe(1); // producto oculto
  });

  it("crea raíz y subcategoría", async () => {
    const root = await repo.createCategory(category());
    const sub = await repo.createCategory(category({ name: "Plata", slug: "anillos-plata", parentId: root.id }));
    expect(sub.parentId).toBe(root.id);
    expect(store.categories.some((c) => c.id === sub.id)).toBe(true);
  });

  it("no permite 3 niveles, ni ser su propio padre, ni volver hija a una que tiene hijas", async () => {
    expect(await code(repo.createCategory(category({ parentId: PERLAS })))).toBe("INVALID_PARENT");
    expect(await code(repo.updateCategory(LLAVEROS, category({ slug: "llaveros", parentId: LLAVEROS })))).toBe("INVALID_PARENT");
    expect(await code(repo.updateCategory(COLLARES, category({ slug: "collares", parentId: LLAVEROS })))).toBe("INVALID_PARENT");
  });

  it("slug repetido falla en el repo; resolveUniqueSlug agrega sufijo", async () => {
    expect(await code(repo.createCategory(category({ slug: "collares" })))).toBe("SLUG_TAKEN");
    expect(await resolveUniqueSlug("collares", (s) => repo.categorySlugExists(s))).toBe("collares-2");
    expect(await resolveUniqueSlug("collares", (s) => repo.categorySlugExists(s, COLLARES))).toBe("collares");
  });

  it("edita", async () => {
    const updated = await repo.updateCategory(LLAVEROS, category({ name: "Llaveros y más", slug: "llaveros", isVisible: false }));
    expect(updated).toMatchObject({ name: "Llaveros y más", isVisible: false });
  });

  it("bloquea borrar con hijas o con productos, con mensaje claro", async () => {
    await expect(repo.deleteCategory(COLLARES)).rejects.toThrow(/tiene 2 subcategorías/);
    await expect(repo.deleteCategory(PERLAS)).rejects.toThrow(/tiene 1 producto asignado/);
    expect(store.categories.some((c) => c.id === COLLARES)).toBe(true);
  });

  it("borra una vacía y devuelve su imagen", async () => {
    store.categories.find((c) => c.id === LLAVEROS)!.imageUrl = "/uploads-dev/x.jpg";
    expect(await repo.deleteCategory(LLAVEROS)).toEqual({ imageUrl: "/uploads-dev/x.jpg" });
    expect(store.categories.some((c) => c.id === LLAVEROS)).toBe(false);
    expect(await code(repo.deleteCategory(LLAVEROS))).toBe("NOT_FOUND");
  });
});

describe("productos", () => {
  it("crea con imágenes ordenadas y categorías sin duplicados", async () => {
    const created = await repo.createProduct(product({ categoryIds: [PERLAS, PERLAS] }));
    expect(created.categoryIds).toEqual([PERLAS]);
    expect(created.images.map((i) => [i.url, i.sortOrder])).toEqual([
      ["/uploads-dev/a.jpg", 1],
      ["/uploads-dev/b.jpg", 2],
    ]);
    expect(await repo.getProduct(created.id)).toEqual(created);
  });

  it("rechaza slug repetido y categorías inexistentes", async () => {
    expect(await code(repo.createProduct(product({ slug: "collar-de-estrella" })))).toBe("SLUG_TAKEN");
    expect(await code(repo.createProduct(product({ categoryIds: ["00000000-0000-4000-8000-000000000099"] })))).toBe("NOT_FOUND");
  });

  it("edita reemplazando imágenes (conserva id de las que siguen) y reordena", async () => {
    const created = await repo.createProduct(product());
    const keptId = created.images[1].id;
    const updated = await repo.updateProduct(created.id, product({ images: [{ url: "/uploads-dev/b.jpg", alt: "B" }, { url: "/uploads-dev/c.jpg", alt: "C" }] }));
    expect(updated.images[0]).toMatchObject({ id: keptId, url: "/uploads-dev/b.jpg", sortOrder: 1 });
    expect(removedUrls(created.images.map((i) => i.url), updated.images.map((i) => i.url))).toEqual(["/uploads-dev/a.jpg"]);
  });

  it("borra y devuelve las URLs de sus imágenes", async () => {
    expect(await repo.deleteProduct(COLLAR)).toEqual({ imageUrls: ["/mock/collar-de-estrella.jpg"] });
    expect(await repo.getProduct(COLLAR)).toBeNull();
    // ya no bloquea borrar Perlas: no le quedan productos
    expect(await code(repo.deleteCategory(PERLAS))).toBe("OK");
  });

  it("filtra y resume (incluye ocultos)", async () => {
    const [products, categories] = await Promise.all([repo.listProducts(), repo.listCategories()]);
    expect(filterProducts(products, categories, { categoryId: COLLARES }).map((p) => p.slug)).toEqual([
      "collar-de-estrella",
      "collar-estrellas-colgantes",
    ]);
    expect(filterProducts(products, categories, { visible: "no" }).map((p) => p.slug)).toEqual(["phonecharm-perlas"]);
    expect(filterProducts(products, categories, { q: "BRAZALETE", soldOut: "si" }).map((p) => p.slug)).toEqual(["brazalete-estrella"]);
    expect(summarize(products, categories)).toEqual({ products: 6, hidden: 1, soldOut: 1, featured: 2, categories: 6, subcategories: 6 });
  });
});

describe("ajustes", () => {
  it("guarda y devuelve copia", async () => {
    const current = await repo.getSettings();
    const saved = await repo.updateSettings({ ...current, storeName: "RAKUUN MX", paymentMethods: ["Efectivo"] });
    expect(saved.storeName).toBe("RAKUUN MX");
    expect(store.settings.paymentMethods).toEqual(["Efectivo"]);
    saved.paymentMethods.push("x");
    expect(store.settings.paymentMethods).toEqual(["Efectivo"]);
  });
});

describe("la instancia por defecto muta los datos de la tienda mock", () => {
  it("un cambio se ve en el repositorio público", async () => {
    const { mockAdminRepository } = await import("./repository.mock");
    const created = await mockAdminRepository.createProduct(product({ slug: "anillo-prueba-tienda" }));
    expect((await mockRepository.getProductBySlug("anillo-prueba-tienda"))?.id).toBe(created.id);
    await mockAdminRepository.deleteProduct(created.id);
    expect(await mockRepository.getProductBySlug("anillo-prueba-tienda")).toBeNull();
  });
});
