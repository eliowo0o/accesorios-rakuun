import { describe, expect, it } from "vitest";
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
