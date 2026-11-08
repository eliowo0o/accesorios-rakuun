"use client";

import { useState } from "react";
import { deleteCategory } from "@/services/admin/actions/categories";
import type { AdminCategory } from "@/services/admin/types";
import { useConfirmAction } from "./useConfirmAction";

export type CategoryEditor =
  | { mode: "create"; parentId: string | null }
  | { mode: "edit"; id: string }
  | null;

/** Qué formulario está abierto en el árbol (crear raíz/sub, o editar uno) + borrar con confirmación. */
export function useCategoryTree() {
  const [editor, setEditor] = useState<CategoryEditor>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const remover = useConfirmAction(deleteCategory);

  const onDelete = (category: AdminCategory) => {
    setDeletingId(category.id);
    remover.run(`¿Borrar «${category.name}»? No se puede deshacer.`, category.id);
  };

  return {
    editor,
    openCreate: (parentId: string | null) => setEditor({ mode: "create", parentId }),
    openEdit: (id: string) => setEditor({ mode: "edit", id }),
    close: () => setEditor(null),
    isEditing: (id: string) => editor?.mode === "edit" && editor.id === id,
    isCreatingUnder: (parentId: string | null) => editor?.mode === "create" && editor.parentId === parentId,
    onDelete,
    deleteError: remover.error,
    deletingId: remover.pending ? deletingId : null,
    errorFor: (id: string) => (deletingId === id ? remover.error : null),
  };
}

export type CategoryTreeController = ReturnType<typeof useCategoryTree>;
