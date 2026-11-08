import { describe, expect, it } from "vitest";
import { parseProductFilters } from "./filters";

describe("parseProductFilters", () => {
  it("sin parámetros no filtra nada", () => {
    expect(parseProductFilters({})).toEqual({
      q: undefined,
      categoryId: undefined,
      visible: undefined,
      soldOut: undefined,
      featured: undefined,
    });
  });

  it("mapea los nombres en español de la URL", () => {
    expect(parseProductFilters({ q: "collar", categoria: "c-1", visible: "no", agotado: "si", destacado: "si" })).toEqual({
      q: "collar",
      categoryId: "c-1",
      visible: "no",
      soldOut: "si",
      featured: "si",
    });
  });

  it("ignora banderas inválidas y vacíos", () => {
    const f = parseProductFilters({ visible: "tal vez", agotado: "", categoria: "", q: "   " });
    expect(f.visible).toBeUndefined();
    expect(f.soldOut).toBeUndefined();
    expect(f.categoryId).toBeUndefined();
    expect(f.q).toBeUndefined();
  });

  it("con valores repetidos toma el primero y recorta la búsqueda a 100", () => {
    const f = parseProductFilters({ q: ["a".repeat(150), "b"], visible: ["si", "no"] });
    expect(f.q).toHaveLength(100);
    expect(f.visible).toBe("si");
  });
});
