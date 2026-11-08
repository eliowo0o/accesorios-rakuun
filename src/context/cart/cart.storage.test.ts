import { describe, expect, it, vi } from "vitest";
import { CART_STORAGE_KEY, loadCart, parseStoredCart, saveCart, serializeCart } from "./cart.storage";

const item = { productId: "p1", slug: "collar", name: "Collar", price: 60, imageUrl: null, quantity: 2 };

describe("parseStoredCart", () => {
  it("lee lo que serializa", () => {
    expect(parseStoredCart(serializeCart([item]))).toEqual([item]);
  });

  it("devuelve [] con null, JSON roto, versión distinta o forma inválida", () => {
    expect(parseStoredCart(null)).toEqual([]);
    expect(parseStoredCart("{nope")).toEqual([]);
    expect(parseStoredCart(JSON.stringify({ version: 2, items: [item] }))).toEqual([]);
    expect(parseStoredCart(JSON.stringify([item]))).toEqual([]);
  });

  it("descarta líneas inválidas o duplicadas y conserva las buenas", () => {
    const raw = JSON.stringify({
      version: 1,
      items: [item, { ...item, price: "60" }, { ...item, productId: "p2", quantity: -1 }, item, { foo: 1 }],
    });
    expect(parseStoredCart(raw)).toEqual([item]);
  });

  it("no guarda campos extra", () => {
    const raw = serializeCart([{ ...item, secret: "x" } as typeof item]);
    expect(raw).not.toContain("secret");
  });
});

describe("loadCart / saveCart", () => {
  it("guarda con la clave versionada y borra si está vacío", () => {
    const storage = { setItem: vi.fn(), removeItem: vi.fn() };
    saveCart([item], storage);
    expect(storage.setItem).toHaveBeenCalledWith(CART_STORAGE_KEY, serializeCart([item]));
    saveCart([], storage);
    expect(storage.removeItem).toHaveBeenCalledWith(CART_STORAGE_KEY);
  });

  it("no lanza si el almacenamiento falla", () => {
    const broken = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceeded");
      },
      removeItem: () => {
        throw new Error("x");
      },
    };
    expect(loadCart(broken)).toEqual([]);
    expect(() => saveCart([item], broken)).not.toThrow();
    expect(loadCart(undefined)).toEqual([]);
    expect(() => saveCart([item], undefined)).not.toThrow();
  });
});
