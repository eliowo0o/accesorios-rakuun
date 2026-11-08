/** Reducer genérico de listas editables (métodos de pago, tipos de entrega, imágenes). Puro. */

export type ListAction<T> =
  | { type: "add"; item: T }
  | { type: "update"; index: number; item: T }
  | { type: "remove"; index: number }
  | { type: "move"; index: number; offset: -1 | 1 };

export function listReducer<T>(items: T[], action: ListAction<T>): T[] {
  switch (action.type) {
    case "add":
      return [...items, action.item];
    case "update":
      return items.map((item, i) => (i === action.index ? action.item : item));
    case "remove":
      return items.filter((_, i) => i !== action.index);
    case "move": {
      const target = action.index + action.offset;
      if (action.index < 0 || action.index >= items.length || target < 0 || target >= items.length) return items;
      const next = [...items];
      [next[action.index], next[target]] = [next[target], next[action.index]];
      return next;
    }
  }
}
