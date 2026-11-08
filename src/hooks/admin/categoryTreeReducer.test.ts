import { describe, expect, it } from "vitest";
import { categoryTreeReducer, initialCategoryTreeState } from "./categoryTreeReducer";

describe("categoryTreeReducer", () => {
  it("abre y cierra formularios (solo uno a la vez)", () => {
    const creating = categoryTreeReducer(initialCategoryTreeState, { type: "openCreate", parentId: "root-1" });
    expect(creating.editor).toEqual({ mode: "create", parentId: "root-1" });
    const editing = categoryTreeReducer(creating, { type: "openEdit", id: "cat-1" });
    expect(editing.editor).toEqual({ mode: "edit", id: "cat-1" });
    expect(categoryTreeReducer(editing, { type: "close" }).editor).toBeNull();
  });

  it("borrar: start marca pendiente y limpia el error; done guarda el error de esa categoría", () => {
    const failed = { ...initialCategoryTreeState, deletingId: "old", deleteError: "x" };
    const started = categoryTreeReducer(failed, { type: "deleteStart", id: "cat-1" });
    expect(started).toMatchObject({ deletingId: "cat-1", deletePending: true, deleteError: null });
    const done = categoryTreeReducer(started, { type: "deleteDone", error: "Tiene productos." });
    expect(done).toMatchObject({ deletingId: "cat-1", deletePending: false, deleteError: "Tiene productos." });
  });

  it("borrar no toca el formulario abierto", () => {
    const open = categoryTreeReducer(initialCategoryTreeState, { type: "openEdit", id: "a" });
    expect(categoryTreeReducer(open, { type: "deleteStart", id: "b" }).editor).toEqual({ mode: "edit", id: "a" });
  });
});
