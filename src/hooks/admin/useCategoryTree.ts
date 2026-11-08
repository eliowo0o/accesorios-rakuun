"use client";

import { useMemo, useReducer, useTransition } from "react";
import { deleteCategory } from "@/services/admin/actions/categories";
import type { AdminCategory } from "@/services/admin/types";
import { categoryTreeReducer, initialCategoryTreeState } from "./categoryTreeReducer";

/**
 * Estado del árbol (qué formulario está abierto + borrar con confirmación) con useReducer.
 * Lo consume CategoryTreeProvider; las filas lo leen por contexto.
 */
export function useCategoryTree(roots: AdminCategory[]) {
  const [state, dispatch] = useReducer(categoryTreeReducer, initialCategoryTreeState);
  const [, startTransition] = useTransition();

  return useMemo(() => {
    const { editor, deletingId, deletePending, deleteError } = state;
    return {
      state: {
        isEditing: (id: string) => editor?.mode === "edit" && editor.id === id,
        isCreatingUnder: (parentId: string | null) => editor?.mode === "create" && editor.parentId === parentId,
        isDeleting: (id: string) => deletePending && deletingId === id,
        errorFor: (id: string) => (deletingId === id ? deleteError : null),
      },
      actions: {
        openCreate: (parentId: string | null) => dispatch({ type: "openCreate", parentId }),
        openEdit: (id: string) => dispatch({ type: "openEdit", id }),
        close: () => dispatch({ type: "close" }),
        remove: (category: AdminCategory) => {
          if (!window.confirm(`¿Borrar «${category.name}»? No se puede deshacer.`)) return;
          dispatch({ type: "deleteStart", id: category.id });
          startTransition(async () => {
            const result = await deleteCategory(category.id);
            dispatch({ type: "deleteDone", error: result.ok ? null : result.error });
          });
        },
      },
      meta: { roots },
    };
  }, [state, roots]);
}

export type CategoryTreeContextValue = ReturnType<typeof useCategoryTree>;
