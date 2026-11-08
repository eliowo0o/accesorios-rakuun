import { describe, expect, it } from "vitest";
import type { CartItem } from "@/types";
import {
  cartReducer,
  clampQuantity,
  initialCartState,
  MAX_QUANTITY,
  selectCount,
  selectTotal,
  type CartProductSnapshot,
  type CartState,
} from "./cartReducer";

const collar: Omit<CartItem, "quantity"> = {
  productId: "p1",
  slug: "collar-estrellas-colgantes",
  name: "Collar estrellas colgantes",
  price: 120,
  imageUrl: "/mock/collar.jpg",
};
const brazalete: Omit<CartItem, "quantity"> = {
  productId: "p2",
  slug: "brazalete-nube",
  name: "Brazalete nube",
  price: 60,
  imageUrl: null,
};

function withItems(...items: CartItem[]): CartState {
  return { ...initialCartState, hydrated: true, items };
}

const snap = (item: Omit<CartItem, "quantity">, patch: Partial<CartProductSnapshot> = {}): CartProductSnapshot => ({
  productId: item.productId,
  slug: item.slug,
  name: item.name,
  price: item.price,
  imageUrl: item.imageUrl,
  isSoldOut: false,
  ...patch,
});

describe("clampQuantity", () => {
  it("limita entre 1 y 99 y trunca decimales", () => {
    expect(clampQuantity(0)).toBe(1);
    expect(clampQuantity(-5)).toBe(1);
    expect(clampQuantity(150)).toBe(MAX_QUANTITY);
    expect(clampQuantity(2.7)).toBe(2);
    expect(clampQuantity(Number.NaN)).toBe(1);
    expect(clampQuantity(Number.POSITIVE_INFINITY)).toBe(1);
  });
});

describe("ADD", () => {
  it("agrega una línea nueva con cantidad 1 por defecto", () => {
    const s = cartReducer(initialCartState, { type: "ADD", item: collar });
    expect(s.items).toEqual([{ ...collar, quantity: 1 }]);
  });

  it("suma cantidades si el producto ya está y actualiza el snapshot", () => {
    const s1 = cartReducer(withItems({ ...collar, quantity: 2 }), { type: "ADD", item: { ...collar, price: 130 }, quantity: 3 });
    expect(s1.items).toEqual([{ ...collar, price: 130, quantity: 5 }]);
  });

  it("no pasa de 99 ni baja de 1", () => {
    const s1 = cartReducer(withItems({ ...collar, quantity: 98 }), { type: "ADD", item: collar, quantity: 5 });
    expect(s1.items[0].quantity).toBe(99);
    const s2 = cartReducer(initialCartState, { type: "ADD", item: collar, quantity: 0 });
    expect(s2.items[0].quantity).toBe(1);
  });

  it("no muta el estado anterior", () => {
    const prev = withItems({ ...collar, quantity: 1 });
    const frozen = JSON.stringify(prev);
    cartReducer(prev, { type: "ADD", item: collar });
    expect(JSON.stringify(prev)).toBe(frozen);
  });
});

describe("REMOVE", () => {
  it("quita la línea", () => {
    const s = cartReducer(withItems({ ...collar, quantity: 1 }, { ...brazalete, quantity: 2 }), { type: "REMOVE", productId: "p1" });
    expect(s.items.map((i) => i.productId)).toEqual(["p2"]);
  });

  it("devuelve el mismo estado si no existe", () => {
    const prev = withItems({ ...collar, quantity: 1 });
    expect(cartReducer(prev, { type: "REMOVE", productId: "nope" })).toBe(prev);
  });
});

describe("SET_QUANTITY", () => {
  it("cambia la cantidad", () => {
    const s = cartReducer(withItems({ ...collar, quantity: 1 }), { type: "SET_QUANTITY", productId: "p1", quantity: 4 });
    expect(s.items[0].quantity).toBe(4);
  });

  it("acota a 1..99 (no borra la línea con 0)", () => {
    const base = withItems({ ...collar, quantity: 3 });
    expect(cartReducer(base, { type: "SET_QUANTITY", productId: "p1", quantity: 0 }).items[0].quantity).toBe(1);
    expect(cartReducer(base, { type: "SET_QUANTITY", productId: "p1", quantity: 500 }).items[0].quantity).toBe(99);
  });

  it("ignora productos inexistentes o cantidades iguales", () => {
    const base = withItems({ ...collar, quantity: 3 });
    expect(cartReducer(base, { type: "SET_QUANTITY", productId: "x", quantity: 2 })).toBe(base);
    expect(cartReducer(base, { type: "SET_QUANTITY", productId: "p1", quantity: 3 })).toBe(base);
  });
});

describe("CLEAR", () => {
  it("vacía líneas y avisos", () => {
    const s = cartReducer(
      { ...withItems({ ...collar, quantity: 1 }), notices: [{ kind: "removed", productId: "p9", name: "X" }] },
      { type: "CLEAR" },
    );
    expect(s.items).toEqual([]);
    expect(s.notices).toEqual([]);
  });

  it("no crea un estado nuevo si ya está vacío", () => {
    expect(cartReducer(initialCartState, { type: "CLEAR" })).toBe(initialCartState);
  });
});

describe("HYDRATE", () => {
  it("la primera vez marca hydrated y mezcla con lo agregado antes", () => {
    const before = cartReducer(initialCartState, { type: "ADD", item: collar });
    const s = cartReducer(before, { type: "HYDRATE", items: [{ ...collar, quantity: 2 }, { ...brazalete, quantity: 1 }] });
    expect(s.hydrated).toBe(true);
    expect(s.items).toEqual([
      { ...collar, quantity: 3 },
      { ...brazalete, quantity: 1 },
    ]);
  });

  it("ya hidratado (cambio en otra pestaña) reemplaza", () => {
    const s = cartReducer(withItems({ ...collar, quantity: 5 }), { type: "HYDRATE", items: [{ ...brazalete, quantity: 2 }] });
    expect(s.items).toEqual([{ ...brazalete, quantity: 2 }]);
  });

  it("acota cantidades guardadas fuera de rango", () => {
    const s = cartReducer(initialCartState, { type: "HYDRATE", items: [{ ...collar, quantity: 400 }] });
    expect(s.items[0].quantity).toBe(99);
  });
});

describe("SYNC_PRODUCTS", () => {
  const base = withItems({ ...collar, quantity: 1 }, { ...brazalete, quantity: 2 });

  it("sin cambios devuelve el mismo estado", () => {
    expect(cartReducer(base, { type: "SYNC_PRODUCTS", requestedIds: ["p1", "p2"], products: [snap(collar), snap(brazalete)] })).toBe(base);
  });

  it("actualiza precio, nombre e imagen y avisa del cambio de precio", () => {
    const s = cartReducer(base, {
      type: "SYNC_PRODUCTS",
      requestedIds: ["p1", "p2"],
      products: [snap(collar, { price: 150, name: "Collar estrellas", imageUrl: "/nueva.jpg" }), snap(brazalete)],
    });
    expect(s.items[0]).toEqual({ ...collar, name: "Collar estrellas", price: 150, imageUrl: "/nueva.jpg", quantity: 1 });
    expect(s.notices).toEqual([{ kind: "priceChanged", productId: "p1", name: "Collar estrellas", oldPrice: 120, newPrice: 150 }]);
  });

  it("actualiza nombre sin aviso si el precio no cambió", () => {
    const s = cartReducer(base, { type: "SYNC_PRODUCTS", requestedIds: ["p1", "p2"], products: [snap(collar, { name: "Nuevo" }), snap(brazalete)] });
    expect(s.items[0].name).toBe("Nuevo");
    expect(s.notices).toEqual([]);
  });

  it("quita productos que ya no existen o se agotaron", () => {
    const s = cartReducer(base, { type: "SYNC_PRODUCTS", requestedIds: ["p1", "p2"], products: [snap(brazalete, { isSoldOut: true })] });
    expect(s.items).toEqual([]);
    expect(s.notices).toEqual([
      { kind: "removed", productId: "p1", name: "Collar estrellas colgantes" },
      { kind: "soldOut", productId: "p2", name: "Brazalete nube" },
    ]);
  });

  it("respeta productos que no se consultaron (agregados mientras viajaba la petición)", () => {
    const s = cartReducer(base, { type: "SYNC_PRODUCTS", requestedIds: ["p1"], products: [snap(collar)] });
    expect(s).toBe(base);
  });
});

describe("DISMISS_NOTICES / OPEN / CLOSE", () => {
  it("limpia avisos", () => {
    const s = cartReducer({ ...initialCartState, notices: [{ kind: "removed", productId: "p", name: "X" }] }, { type: "DISMISS_NOTICES" });
    expect(s.notices).toEqual([]);
    expect(cartReducer(initialCartState, { type: "DISMISS_NOTICES" })).toBe(initialCartState);
  });

  it("abre y cierra sin estados nuevos innecesarios", () => {
    const open = cartReducer(initialCartState, { type: "OPEN" });
    expect(open.isOpen).toBe(true);
    expect(cartReducer(open, { type: "OPEN" })).toBe(open);
    const closed = cartReducer(open, { type: "CLOSE" });
    expect(closed.isOpen).toBe(false);
    expect(cartReducer(closed, { type: "CLOSE" })).toBe(closed);
  });

  it("ignora acciones desconocidas", () => {
    // @ts-expect-error acción inválida a propósito
    expect(cartReducer(initialCartState, { type: "NOPE" })).toBe(initialCartState);
  });
});

describe("selectores", () => {
  it("cuenta y totaliza", () => {
    const items = [
      { ...collar, quantity: 1 },
      { ...brazalete, quantity: 2 },
    ];
    expect(selectCount(items)).toBe(3);
    expect(selectTotal(items)).toBe(240);
    expect(selectTotal([{ ...collar, price: 0.1, quantity: 3 }])).toBe(0.3);
  });
});
