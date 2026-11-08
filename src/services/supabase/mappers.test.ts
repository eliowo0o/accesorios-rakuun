import { describe, expect, it } from "vitest";
import {
  buildCategoryTree,
  categoryScope,
  computeProductCounts,
  escapeLike,
  mapProduct,
  mapProducts,
  mapStoreSettings,
  normalizeSearch,
  toCategoryRef,
  toSearchPattern,
  withReachableParents,
  type CategoryRecord,
  type ProductRecord,
} from "./mappers";

const cat = (id: string, parent_id: string | null, sort_order = 0, name = id): CategoryRecord => ({
  id,
  parent_id,
  name,
  slug: `slug-${id}`,
  description: null,
  image_url: null,
  sort_order,
  is_visible: true,
});

const categories: CategoryRecord[] = [
  cat("b", null, 2, "Pulseras"),
  cat("a", null, 1, "Collares"),
  cat("a2", "a", 2, "Con dije"),
  cat("a1", "a", 1, "Perlas"),
  cat("b1", "b", 1, "Brazaletes"),
];

const product = (over: Partial<ProductRecord> = {}): ProductRecord => ({
  id: "p1",
  name: "Collar",
  slug: "collar",
  description: null,
  price: 60,
  is_visible: true,
  is_sold_out: false,
  is_featured: false,
  sort_order: 0,
  created_at: "2026-11-08T00:00:00Z",
  updated_at: "2026-11-08T00:00:00Z",
  product_images: [],
  product_categories: [],
  ...over,
});

describe("búsqueda", () => {
  it("normaliza acentos, mayúsculas y espacios", () => {
    expect(normalizeSearch("  Ñandú ÉSTRELLA ")).toBe("nandu estrella");
  });

  it("escapa comodines de LIKE", () => {
    expect(escapeLike("50%_off\\")).toBe("50\\%\\_off\\\\");
  });

  it("arma el patrón 'contiene' o null si está vacío", () => {
    expect(toSearchPattern("Estrélla")).toBe("%estrella%");
    expect(toSearchPattern("100%")).toBe("%100\\%%");
    expect(toSearchPattern("   ")).toBeNull();
  });
});

describe("categorías", () => {
  it("categoryScope incluye la categoría y sus hijas", () => {
    expect([...categoryScope("a", categories)].sort()).toEqual(["a", "a1", "a2"]);
    expect([...categoryScope("a1", categories)]).toEqual(["a1"]);
  });

  it("cuenta productos de la raíz + hijas sin duplicados e ignora categorías desconocidas", () => {
    const counts = computeProductCounts(categories, [
      { product_id: "p1", category_id: "a1" },
      { product_id: "p1", category_id: "a2" }, // mismo producto en 2 hijas
      { product_id: "p2", category_id: "a2" },
      { product_id: "p3", category_id: "a" }, // directo en la raíz
      { product_id: "p4", category_id: "oculta" },
    ]);
    expect(counts.get("a")).toBe(3);
    expect(counts.get("a1")).toBe(1);
    expect(counts.get("a2")).toBe(2);
    expect(counts.get("b")).toBe(0);
  });

  it("buildCategoryTree ordena raíces e hijas por sort_order y mapea a camelCase", () => {
    const tree = buildCategoryTree(categories, [{ product_id: "p1", category_id: "b1" }]);
    expect(tree.map((c) => c.id)).toEqual(["a", "b"]);
    expect(tree[0].children.map((c) => c.id)).toEqual(["a1", "a2"]);
    expect(tree[1]).toMatchObject({ parentId: null, slug: "slug-b", sortOrder: 2, isVisible: true, productCount: 1 });
    expect(tree[1].children[0]).toMatchObject({ parentId: "b", productCount: 1, imageUrl: null });
  });

  it("toCategoryRef pone parentSlug solo en subcategorías", () => {
    const byId = new Map(categories.map((c) => [c.id, c]));
    expect(toCategoryRef("a1", byId)).toEqual({ id: "a1", name: "Perlas", slug: "slug-a1", parentSlug: "slug-a" });
    expect(toCategoryRef("a", byId)?.parentSlug).toBeNull();
    expect(toCategoryRef("nope", byId)).toBeNull();
  });

  it("toCategoryRef devuelve null si el padre no está (oculto)", () => {
    const byId = new Map(categories.filter((c) => c.id !== "a").map((c) => [c.id, c]));
    expect(toCategoryRef("a1", byId)).toBeNull();
    expect(toCategoryRef("b1", byId)?.parentSlug).toBe("slug-b");
  });

  it("withReachableParents quita subcategorías de padres ocultos", () => {
    const visible = categories.filter((c) => c.id !== "a");
    expect(withReachableParents(visible).map((c) => c.id)).toEqual(["b", "b1"]);
  });
});

describe("productos", () => {
  const byId = new Map(categories.map((c) => [c.id, c]));

  it("mapea snake_case, ordena imágenes y resuelve categorías", () => {
    const p = mapProduct(
      product({
        price: "120.50" as unknown as number,
        is_sold_out: true,
        product_images: [
          { id: "i2", url: "/2.jpg", alt: "dos", sort_order: 2 },
          { id: "i1", url: "/1.jpg", alt: "uno", sort_order: 1 },
        ],
        product_categories: [{ category_id: "a1" }, { category_id: "oculta" }],
      }),
      byId,
    );
    expect(p.price).toBe(120.5);
    expect(p.isSoldOut).toBe(true);
    expect(p.images.map((i) => i.id)).toEqual(["i1", "i2"]);
    expect(p.images[0]).toEqual({ id: "i1", url: "/1.jpg", alt: "uno", sortOrder: 1 });
    expect(p.categories).toEqual([{ id: "a1", name: "Perlas", slug: "slug-a1", parentSlug: "slug-a" }]);
    expect(p.createdAt).toBe("2026-11-08T00:00:00Z");
  });

  it("tolera embeds null", () => {
    const p = mapProduct(product({ product_images: null, product_categories: null }), byId);
    expect(p.images).toEqual([]);
    expect(p.categories).toEqual([]);
  });

  it("mapProducts excluye ocultos y ordena destacados primero, luego sort_order y nombre", () => {
    const list = mapProducts(
      [
        product({ id: "1", name: "B", sort_order: 1 }),
        product({ id: "2", name: "A", sort_order: 1 }),
        product({ id: "3", name: "Z", sort_order: 9, is_featured: true }),
        product({ id: "4", name: "Oculto", is_visible: false, is_featured: true }),
        product({ id: "5", name: "C", sort_order: 0 }),
      ],
      categories,
    );
    expect(list.map((p) => p.id)).toEqual(["3", "5", "2", "1"]);
  });
});

describe("ajustes", () => {
  it("mapea store_settings", () => {
    expect(
      mapStoreSettings({
        store_name: "RAKUUN",
        tagline: "Envíos",
        hero_image_url: null,
        logo_url: "/logo.jpg",
        whatsapp_number: "5215500000000",
        instagram_url: null,
        location: "CDMX",
        payment_methods: ["Efectivo"],
        delivery_options: ["Recojo"],
      }),
    ).toEqual({
      storeName: "RAKUUN",
      tagline: "Envíos",
      heroImageUrl: null,
      logoUrl: "/logo.jpg",
      whatsappNumber: "5215500000000",
      instagramUrl: null,
      location: "CDMX",
      paymentMethods: ["Efectivo"],
      deliveryOptions: ["Recojo"],
    });
  });
});
