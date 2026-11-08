import { describe, expect, it } from "vitest";
import { formatPrice, formatPricePlain } from "./format";
import { slugify } from "./slug";

describe("formatPrice", () => {
  it("usa el formato de la tienda", () => {
    expect(formatPrice(60)).toBe("MXN $ 60,00");
    expect(formatPrice(1250.5)).toBe("MXN $ 1.250,50");
  });
  it("formato plano para WhatsApp", () => {
    expect(formatPricePlain(120)).toBe("$120.00");
  });
});

describe("slugify", () => {
  it("quita acentos y símbolos", () => {
    expect(slugify("  Collar de Estrella ñ! ")).toBe("collar-de-estrella-n");
  });
});
