import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Product } from "@/types";

const getAllProducts = vi.fn<() => Promise<Product[]>>();
vi.mock("@/services/catalog", () => ({ getAllProducts: () => getAllProducts() }));

const { syncCartProducts } = await import("./cart-actions");

const product = (id: string, patch: Partial<Product> = {}): Product => ({
  id,
  name: `Producto ${id}`,
  slug: `producto-${id}`,
  description: null,
  price: 60,
  isVisible: true,
  isSoldOut: false,
  isFeatured: false,
  sortOrder: 1,
  images: [{ id: "i", url: `/img/${id}.jpg`, alt: "", sortOrder: 1 }],
  categories: [],
  createdAt: "",
  updatedAt: "",
  ...patch,
});

describe("syncCartProducts", () => {
  beforeEach(() => getAllProducts.mockReset());

  it("devuelve solo los productos pedidos con sus datos actuales", async () => {
    getAllProducts.mockResolvedValue([product("a"), product("b", { price: 90, isSoldOut: true, images: [] }), product("c")]);
    await expect(syncCartProducts(["b", "a", "zzz"])).resolves.toEqual([
      { productId: "a", slug: "producto-a", name: "Producto a", price: 60, imageUrl: "/img/a.jpg", isSoldOut: false },
      { productId: "b", slug: "producto-b", name: "Producto b", price: 90, imageUrl: null, isSoldOut: true },
    ]);
  });

  it("no consulta el catálogo con entrada vacía o inválida", async () => {
    await expect(syncCartProducts([])).resolves.toEqual([]);
    await expect(syncCartProducts("x" as unknown as string[])).resolves.toEqual([]);
    expect(getAllProducts).not.toHaveBeenCalled();
  });
});
