import type { ProductFilters } from "./types";

/** searchParams tal como los entrega Next (`await props.searchParams`). */
export type SearchParamsRecord = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

const flag = (v: string | string[] | undefined) => {
  const value = one(v);
  return value === "si" || value === "no" ? value : undefined;
};

/** Filtros de la lista de productos del admin desde la URL (?q=&categoria=&visible=&agotado=&destacado=). Pura. */
export function parseProductFilters(sp: SearchParamsRecord): ProductFilters {
  return {
    q: one(sp.q)?.trim().slice(0, 100) || undefined,
    categoryId: one(sp.categoria),
    visible: flag(sp.visible),
    soldOut: flag(sp.agotado),
    featured: flag(sp.destacado),
  };
}
