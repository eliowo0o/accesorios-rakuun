import { describe, expect, it } from "vitest";
import type { CategoryWithChildren, Product } from "@/types";
import {
  buildCategoryLookup,
  categoryBreadcrumbs,
  categoryHref,
  findParentOf,
  labelWithinRoot,
  pickRelated,
  productBreadcrumbs,
  productCategoryLabel,
} from "./catalog";

const cat = (id: string, name: string, slug: string, parentId: string | null = null) => ({
  id,
  parentId,
  name,
  slug,
  description: null,
  imageUrl: null,
  sortOrder: 1,
  isVisible: true,
  productCount: 1,
});

const tree: CategoryWithChildren[] = [
  { ...cat("c1", "Collares", "collares"), children: [cat("c11", "Perlas", "collares-perlas", "c1")] },
  { ...cat("c2", "Aretes", "aretes"), children: [] },
];

const product = (over: Partial<Product> = {}): Product => ({
  id: "p1",
  name: "Collar de estrella",
  slug: "collar-de-estrella",
  description: null,
  price: 60,
  isVisible: true,
  isSoldOut: false,
  isFeatured: false,
  sortOrder: 1,
  images: [],
  categories: [{ id: "c11", name: "Perlas", slug: "collares-perlas", parentSlug: "collares" }],
  createdAt: "",
  updatedAt: "",
  ...over,
});

describe("catálogo (helpers de la tienda)", () => {
  const lookup = buildCategoryLookup(tree);

  it("la etiqueta de la tarjeta es la categoría raíz", () => {
    expect(productCategoryLabel(product(), lookup)).toBe("Collares");
    expect(productCategoryLabel(product({ categories: [] }), lookup)).toBeNull();
  });

  it("dentro de una raíz la etiqueta es la subcategoría", () => {
    expect(labelWithinRoot(product(), { slug: "collares", name: "Collares" })).toBe("Perlas");
    expect(labelWithinRoot(product({ categories: [] }), { slug: "collares", name: "Collares" })).toBe("Collares");
  });

  it("arma URLs y migas de categoría y producto", () => {
    expect(categoryHref(product().categories[0])).toBe("/categoria/collares/collares-perlas");
    expect(categoryBreadcrumbs({ name: "Collares", slug: "collares" }).map((c) => c.href)).toEqual(["/", "/categoria/collares"]);
    expect(productBreadcrumbs(product(), lookup).map((c) => c.name)).toEqual(["Inicio", "Collares", "Perlas", "Collar de estrella"]);
  });

  it("encuentra la raíz de una subcategoría", () => {
    expect(findParentOf(tree, "collares-perlas")?.slug).toBe("collares");
    expect(findParentOf(tree, "nada")).toBeNull();
  });

  it("relacionados excluye el actual, pone agotados al final y limita", () => {
    const current = product();
    const list = [
      current,
      product({ id: "a", isSoldOut: true }),
      product({ id: "b" }),
      product({ id: "c" }),
      product({ id: "d" }),
      product({ id: "e" }),
    ];
    const related = pickRelated(list, current, 4);
    expect(related.map((p) => p.id)).toEqual(["b", "c", "d", "e"]);
  });
});
