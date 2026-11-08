/** Estado del árbol de categorías del admin: qué formulario está abierto + borrado en curso. Reducer puro. */

export type CategoryEditor =
  | { mode: "create"; parentId: string | null }
  | { mode: "edit"; id: string }
  | null;

export interface CategoryTreeState {
  editor: CategoryEditor;
  /** Categoría del último intento de borrado (para mostrar su error junto a ella). */
  deletingId: string | null;
  deletePending: boolean;
  deleteError: string | null;
}

export type CategoryTreeAction =
  | { type: "openCreate"; parentId: string | null }
  | { type: "openEdit"; id: string }
  | { type: "close" }
  | { type: "deleteStart"; id: string }
  | { type: "deleteDone"; error: string | null };

export const initialCategoryTreeState: CategoryTreeState = {
  editor: null,
  deletingId: null,
  deletePending: false,
  deleteError: null,
};

export function categoryTreeReducer(state: CategoryTreeState, action: CategoryTreeAction): CategoryTreeState {
  switch (action.type) {
    case "openCreate":
      return { ...state, editor: { mode: "create", parentId: action.parentId } };
    case "openEdit":
      return { ...state, editor: { mode: "edit", id: action.id } };
    case "close":
      return { ...state, editor: null };
    case "deleteStart":
      return { ...state, deletingId: action.id, deletePending: true, deleteError: null };
    case "deleteDone":
      return { ...state, deletePending: false, deleteError: action.error };
  }
}
