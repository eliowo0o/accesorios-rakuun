import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mockCategories, mockProducts } from "./data";
import { mockRepository } from "./repository";

describe("mockRepository", () => {
  it("cuenta productos visibles por categoría incluyendo subcategorías, sin duplicados", async () => {
    const tree = await mockRepository.getCategoryTree();
    const bySlug = new Map(tree.flatMap((c) => [c, ...c.children]).map((c) => [c.slug, c.productCount]));
    // Collar de estrella está en Perlas y Con dije: cuenta una sola vez en Collares.
    expect(bySlug.get("collares")).toBe(2);
    expect(bySlug.get("collares-perlas")).toBe(1);
    expect(bySlug.get("collares-con-dije")).toBe(2);
    expect(bySlug.get("pulseras")).toBe(2);
    expect(bySlug.get("broches")).toBe(1);
    // El único phonecharm está oculto.
    expect(bySlug.get("phonecharms")).toBe(0);
    expect(bySlug.get("aretes")).toBe(0);
  });

  it("ordena el árbol por sortOrder", async () => {
    const tree = await mockRepository.getCategoryTree();
    expect(tree.map((c) => c.slug)).toEqual(["collares", "aretes", "pulseras", "llaveros", "broches", "phonecharms"]);
    expect(tree[0].children.map((c) => c.slug)).toEqual(["collares-perlas", "collares-con-dije"]);
  });

  it("getProductsByCategory de una raíz incluye subcategorías sin duplicados", async () => {
    const collares = await mockRepository.getCategoryBySlug("collares");
    const products = await mockRepository.getProductsByCategory(collares!.id);
    expect(products.map((p) => p.slug)).toEqual(["collar-de-estrella", "collar-estrellas-colgantes"]);
  });

  it("busca sin acentos ni mayúsculas", async () => {
    const results = await mockRepository.searchProducts("ILUSTRACIÓN");
    expect(results.map((p) => p.slug)).toEqual(["broche-mapache"]);
    const sinAcento = await mockRepository.searchProducts("ilustracion");
    expect(sinAcento.map((p) => p.slug)).toEqual(["broche-mapache"]);
    expect(await mockRepository.searchProducts("   ")).toEqual([]);
  });

  it("excluye productos ocultos en listados, búsqueda y detalle", async () => {
    const all = await mockRepository.getAllProducts();
    expect(all.some((p) => p.slug === "phonecharm-perlas")).toBe(false);
    expect(all.every((p) => p.isVisible)).toBe(true);
    expect(await mockRepository.searchProducts("phonecharm")).toEqual([]);
    expect(await mockRepository.getProductBySlug("phonecharm-perlas")).toBeNull();
  });

  it("ordena destacados primero, luego sortOrder", async () => {
    const all = await mockRepository.getAllProducts();
    expect(all.map((p) => p.slug)).toEqual([
      "collar-de-estrella",
      "brazalete-nube",
      "collar-estrellas-colgantes",
      "brazalete-estrella",
      "broche-mapache",
    ]);
    const featured = await mockRepository.getFeaturedProducts();
    expect(featured.every((p) => p.isFeatured)).toBe(true);
    expect(featured.map((p) => p.slug)).toEqual(["collar-de-estrella", "brazalete-nube"]);
  });

  it("devuelve categorías del producto con parentSlug e imágenes ordenadas", async () => {
    const p = await mockRepository.getProductBySlug("brazalete-estrella");
    expect(p?.categories).toEqual([
      { id: "00000000-0000-4000-8000-000000000031", name: "Brazaletes", slug: "pulseras-brazaletes", parentSlug: "pulseras" },
    ]);
    expect(p?.images.map((i) => i.sortOrder)).toEqual([1, 2]);
  });
});

describe("mockRepository con categorías ocultas", () => {
  const hiddenRoot = { id: "h-root", parentId: null, name: "Ocultos", slug: "ocultos", description: null, imageUrl: null, sortOrder: 99, isVisible: false };
  const orphan = { id: "h-orphan", parentId: "h-root", name: "Huérfana", slug: "huerfana", description: null, imageUrl: null, sortOrder: 1, isVisible: true };
  const hiddenSub = { id: "h-sub", parentId: mockCategories[0].id, name: "Oculta", slug: "collares-oculta", description: null, imageUrl: null, sortOrder: 9, isVisible: false };
  const broche = mockProducts.find((p) => p.slug === "broche-mapache")!;
  const originalIds = [...broche.categoryIds];

  beforeAll(() => {
    mockCategories.push(hiddenRoot, orphan, hiddenSub);
    broche.categoryIds.push(orphan.id, hiddenSub.id);
  });
  afterAll(() => {
    mockCategories.splice(mockCategories.length - 3, 3);
    broche.categoryIds.splice(0, broche.categoryIds.length, ...originalIds);
  });

  it("excluye subcategorías visibles cuyo padre está oculto", async () => {
    const tree = await mockRepository.getCategoryTree();
    const slugs = tree.flatMap((c) => [c.slug, ...c.children.map((ch) => ch.slug)]);
    expect(slugs).not.toContain("ocultos");
    expect(slugs).not.toContain("huerfana");
    expect(await mockRepository.getCategoryBySlug("huerfana")).toBeNull();
    expect(await mockRepository.getProductsByCategory(orphan.id)).toEqual([]);
  });

  it("no genera CategoryRef a categorías ocultas ni a hijas de padres ocultos", async () => {
    const p = await mockRepository.getProductBySlug("broche-mapache");
    expect(p!.categories.map((c) => c.slug)).toEqual(["broches-pines"]);
  });

  it("los conteos no incluyen productos de subcategorías ocultas", async () => {
    const collares = await mockRepository.getCategoryBySlug("collares");
    expect(collares!.productCount).toBe(2);
    const products = await mockRepository.getProductsByCategory(collares!.id);
    expect(products.some((p) => p.slug === "broche-mapache")).toBe(false);
  });
});

describe("getProductCount", () => {
  it("cuenta solo productos visibles", async () => {
    expect(await mockRepository.getProductCount()).toBe((await mockRepository.getAllProducts()).length);
  });
});
