import { describe, expect, it } from "vitest";
import { initialUploadState, isUploading, uploadReducer, validateImageFile, type UploadQueueState } from "./imageUploadReducer";
import { listReducer } from "./listEditorReducer";

const withTwo = (): UploadQueueState =>
  uploadReducer(initialUploadState, {
    type: "add",
    items: [
      { id: "a", name: "a.jpg" },
      { id: "b", name: "b.gif", error: "Solo JPG, PNG o WebP." },
    ],
  });

describe("uploadReducer", () => {
  it("agrega como pending o error según validación", () => {
    const s = withTwo();
    expect(s.items.map((i) => i.status)).toEqual(["pending", "error"]);
    expect(s.items[1].error).toBe("Solo JPG, PNG o WebP.");
    expect(isUploading(s)).toBe(true);
  });

  it("pending → uploading → progreso → done", () => {
    let s = uploadReducer(withTwo(), { type: "start", id: "a" });
    expect(s.items[0]).toMatchObject({ status: "uploading", progress: 0 });
    s = uploadReducer(s, { type: "progress", id: "a", progress: 42.4 });
    expect(s.items[0].progress).toBe(42);
    s = uploadReducer(s, { type: "progress", id: "a", progress: 10 });
    expect(s.items[0].progress).toBe(42); // nunca retrocede
    s = uploadReducer(s, { type: "progress", id: "a", progress: 180 });
    expect(s.items[0].progress).toBe(100);
    s = uploadReducer(s, { type: "success", id: "a", url: "/uploads-dev/x.jpg" });
    expect(s.items[0]).toMatchObject({ status: "done", progress: 100, url: "/uploads-dev/x.jpg" });
    expect(isUploading(s)).toBe(false);
  });

  it("ignora progreso si no está subiendo", () => {
    const s = withTwo();
    expect(uploadReducer(s, { type: "progress", id: "a", progress: 50 })).toBe(s);
  });

  it("fail, remove y clearFinished", () => {
    let s = uploadReducer(withTwo(), { type: "start", id: "a" });
    s = uploadReducer(s, { type: "fail", id: "a", error: "La subida falló (403)." });
    expect(s.items[0]).toMatchObject({ status: "error", error: "La subida falló (403)." });
    expect(uploadReducer(s, { type: "remove", id: "a" }).items.map((i) => i.id)).toEqual(["b"]);
    expect(uploadReducer(s, { type: "clearFinished" }).items).toEqual([]);
  });
});

describe("validateImageFile", () => {
  it("valida tipo y tamaño", () => {
    expect(validateImageFile({ type: "image/jpeg", size: 1000 })).toBeNull();
    expect(validateImageFile({ type: "image/heic", size: 1000 })).toMatch(/JPG/);
    expect(validateImageFile({ type: "image/png", size: 0 })).toMatch(/vacío/);
    expect(validateImageFile({ type: "image/png", size: 6 * 1024 * 1024 })).toMatch(/5 MB/);
  });
});

describe("listReducer", () => {
  it("add, update, remove y move con límites", () => {
    let items = listReducer(["a", "b"], { type: "add", item: "c" });
    expect(items).toEqual(["a", "b", "c"]);
    items = listReducer(items, { type: "move", index: 2, offset: -1 });
    expect(items).toEqual(["a", "c", "b"]);
    expect(listReducer(items, { type: "move", index: 0, offset: -1 })).toBe(items);
    expect(listReducer(items, { type: "move", index: 2, offset: 1 })).toBe(items);
    expect(listReducer(items, { type: "update", index: 1, item: "C" })).toEqual(["a", "C", "b"]);
    expect(listReducer(items, { type: "remove", index: 0 })).toEqual(["c", "b"]);
  });
});
