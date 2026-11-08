"use client";

import { useCallback, useReducer, useState, type KeyboardEvent } from "react";
import { listReducer, type ListAction } from "./listEditorReducer";

/** Lista ordenable genérica: agregar, editar, quitar, subir/bajar. */
export function useListEditor<T>(initial: T[]) {
  const [items, dispatch] = useReducer(listReducer<T>, initial) as [T[], (a: ListAction<T>) => void];

  return {
    items,
    add: useCallback((item: T) => dispatch({ type: "add", item }), [dispatch]),
    update: useCallback((index: number, item: T) => dispatch({ type: "update", index, item }), [dispatch]),
    remove: useCallback((index: number) => dispatch({ type: "remove", index }), [dispatch]),
    moveUp: useCallback((index: number) => dispatch({ type: "move", index, offset: -1 }), [dispatch]),
    moveDown: useCallback((index: number) => dispatch({ type: "move", index, offset: 1 }), [dispatch]),
  };
}

/** Lista de textos con un campo "nuevo" (para ajustes: métodos de pago, tipos de entrega). */
export function useStringListEditor(initial: string[]) {
  const list = useListEditor<string>(initial);
  const [draft, setDraft] = useState("");

  const addDraft = () => {
    const value = draft.trim();
    if (!value || list.items.includes(value)) return;
    list.add(value);
    setDraft("");
  };

  /** Enter en el campo "nuevo" agrega (y no envía el formulario). */
  const onDraftKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addDraft();
  };

  return { ...list, draft, setDraft, addDraft, onDraftKeyDown };
}

export type StringListController = ReturnType<typeof useStringListEditor>;
