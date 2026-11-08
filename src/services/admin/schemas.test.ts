import { describe, expect, it } from "vitest";
import {
  MAX_IMAGE_BYTES,
  parseCategoryForm,
  parseLoginForm,
  parseProductForm,
  parseSettingsForm,
  toFieldErrors,
  uploadRequestSchema,
} from "./schemas";

const fd = (entries: [string, string][]) => {
  const form = new FormData();
  entries.forEach(([k, v]) => form.append(k, v));
  return form;
};

const CAT = "00000000-0000-4000-8000-000000000011";

describe("parseCategoryForm", () => {
  it("convierte vacíos a null y checkbox a boolean", () => {
    const r = parseCategoryForm(fd([["name", "  Collares "], ["slug", ""], ["description", ""], ["parentId", ""], ["sortOrder", ""]]));
    expect(r.success).toBe(true);
    expect(r.data).toEqual({ name: "Collares", slug: "", description: null, imageUrl: null, parentId: null, sortOrder: 0, isVisible: false });
  });

  it("acepta padre uuid y visible", () => {
    const r = parseCategoryForm(fd([["name", "Perlas"], ["parentId", CAT], ["isVisible", "on"], ["sortOrder", "3"]]));
    expect(r.data).toMatchObject({ parentId: CAT, isVisible: true, sortOrder: 3 });
  });

  it("rechaza nombre vacío, padre no uuid y orden negativo", () => {
    const r = parseCategoryForm(fd([["name", "  "], ["parentId", "abc"], ["sortOrder", "-1"]]));
    expect(r.success).toBe(false);
    const errors = toFieldErrors(r.error!);
    expect(errors.name?.[0]).toBe("Escribe el nombre");
    expect(errors.parentId).toBeDefined();
    expect(errors.sortOrder).toBeDefined();
  });

  it("rechaza URLs de imagen peligrosas", () => {
    for (const bad of ["javascript:alert(1)", "//evil.com/x.jpg", "http://inseguro.com/x.jpg", "data:image/png;base64,AAA"]) {
      expect(parseCategoryForm(fd([["name", "X"], ["imageUrl", bad]])).success).toBe(false);
    }
    expect(parseCategoryForm(fd([["name", "X"], ["imageUrl", "https://b.s3.us-east-1.amazonaws.com/categories/a.jpg"]])).success).toBe(true);
    expect(parseCategoryForm(fd([["name", "X"], ["imageUrl", "/mock/a.jpg"]])).success).toBe(true);
  });
});

describe("parseProductForm", () => {
  const base: [string, string][] = [["name", "Collar"], ["price", "60"]];

  it("parsea precio con coma, categorías múltiples e imágenes JSON", () => {
    const r = parseProductForm(
      fd([
        ...base.slice(0, 1),
        ["price", "60,5"],
        ["categoryIds", CAT],
        ["categoryIds", "00000000-0000-4000-8000-000000000012"],
        ["images", JSON.stringify([{ url: "/mock/a.jpg", alt: "A" }])],
        ["isFeatured", "on"],
      ]),
    );
    expect(r.success).toBe(true);
    expect(r.data).toMatchObject({ price: 60.5, isFeatured: true, isVisible: false, isSoldOut: false, sortOrder: 0 });
    expect(r.data!.categoryIds).toHaveLength(2);
    expect(r.data!.images).toEqual([{ url: "/mock/a.jpg", alt: "A" }]);
  });

  it("redondea el precio a 2 decimales", () => {
    expect(parseProductForm(fd([["name", "X"], ["price", "10.129"]])).data?.price).toBe(10.13);
  });

  it("exige precio válido y no negativo", () => {
    expect(toFieldErrors(parseProductForm(fd([["name", "X"], ["price", ""]])).error!).price).toBeDefined();
    expect(toFieldErrors(parseProductForm(fd([["name", "X"], ["price", "abc"]])).error!).price).toBeDefined();
    expect(toFieldErrors(parseProductForm(fd([["name", "X"], ["price", "-1"]])).error!).price).toBeDefined();
  });

  it("rechaza JSON de imágenes roto o con URL inválida", () => {
    expect(parseProductForm(fd([...base, ["images", "{roto"]])).success).toBe(false);
    expect(parseProductForm(fd([...base, ["images", JSON.stringify([{ url: "javascript:x", alt: "" }])]])).success).toBe(false);
  });

  it("limita a 12 imágenes", () => {
    const many = Array.from({ length: 13 }, (_, i) => ({ url: `/mock/${i}.jpg`, alt: "" }));
    expect(parseProductForm(fd([...base, ["images", JSON.stringify(many)]])).success).toBe(false);
  });
});

describe("parseSettingsForm", () => {
  const valid: [string, string][] = [
    ["storeName", "RAKUUN"],
    ["tagline", "Envíos a todo México"],
    ["whatsappNumber", "+52 1 55 1234 5678"],
    ["instagramUrl", ""],
    ["paymentMethods", "Efectivo"],
    ["paymentMethods", " "],
    ["paymentMethods", "Efectivo"],
    ["deliveryOptions", "Envío nacional"],
  ];

  it("normaliza WhatsApp, quita vacíos y duplicados en listas", () => {
    const r = parseSettingsForm(fd(valid));
    expect(r.success).toBe(true);
    expect(r.data).toMatchObject({ whatsappNumber: "5215512345678", instagramUrl: null, paymentMethods: ["Efectivo"], heroImageUrl: null });
  });

  it("exige al menos un método de pago y un WhatsApp válido", () => {
    const r = parseSettingsForm(fd([["storeName", "R"], ["whatsappNumber", "123"], ["deliveryOptions", "Recojo"]]));
    const errors = toFieldErrors(r.error!);
    expect(errors.whatsappNumber).toBeDefined();
    expect(errors.paymentMethods).toBeDefined();
  });

  it("instagram debe ser https", () => {
    const r = parseSettingsForm(fd([...valid.filter(([k]) => k !== "instagramUrl"), ["instagramUrl", "instagram.com/x"]]));
    expect(toFieldErrors(r.error!).instagramUrl).toBeDefined();
  });
});

describe("login y subidas", () => {
  it("valida correo", () => {
    expect(parseLoginForm(fd([["email", "no-es-correo"], ["password", "x"]])).success).toBe(false);
    expect(parseLoginForm(fd([["email", " a@b.mx "], ["password", "x"]])).data?.email).toBe("a@b.mx");
  });

  it("solo jpeg/png/webp de máximo 5 MB en carpetas conocidas", () => {
    expect(uploadRequestSchema.safeParse({ contentType: "image/webp", size: 1000, folder: "products" }).success).toBe(true);
    expect(uploadRequestSchema.safeParse({ contentType: "image/gif", size: 1000, folder: "products" }).success).toBe(false);
    expect(uploadRequestSchema.safeParse({ contentType: "image/png", size: MAX_IMAGE_BYTES + 1, folder: "products" }).success).toBe(false);
    expect(uploadRequestSchema.safeParse({ contentType: "image/png", size: 10, folder: "../etc" }).success).toBe(false);
  });
});
