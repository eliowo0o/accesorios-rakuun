import { describe, expect, it } from "vitest";
import type { CartItem, CheckoutForm } from "@/types";
import { buildInfoMessage, buildOrderMessage, buildWhatsAppUrl, MAX_WHATSAPP_URL_LENGTH } from "./whatsapp";

const settings = { storeName: "RAKUUN", whatsappNumber: "5215500000000" };
const site = "https://rakuun.mx";

const items: CartItem[] = [
  { productId: "p2", slug: "collar-estrellas-colgantes", name: "Collar estrellas colgantes", price: 120, imageUrl: null, quantity: 1 },
  { productId: "p3", slug: "brazalete-nube", name: "Brazalete nube", price: 60, imageUrl: null, quantity: 2 },
];

const form: CheckoutForm = {
  name: "  Ana ",
  delivery: "Envío nacional",
  payment: "Transferencia",
  note: "Para regalo, por favor",
};

describe("buildWhatsAppUrl", () => {
  it("usa wa.me con el número solo en dígitos y el texto codificado", () => {
    expect(buildWhatsAppUrl("+52 1 55 0000 0000", "Hola & adiós ✨")).toBe(
      `https://wa.me/5215500000000?text=${encodeURIComponent("Hola & adiós ✨")}`,
    );
  });
});

describe("buildOrderMessage", () => {
  it("arma el formato acordado", () => {
    expect(buildOrderMessage(items, form, settings, site)).toBe(
      [
        "¡Hola RAKUUN! 👋 Quiero hacer un pedido:",
        "",
        "• 1 × Collar estrellas colgantes — $120.00",
        "  https://rakuun.mx/producto/collar-estrellas-colgantes",
        "• 2 × Brazalete nube — $120.00",
        "  https://rakuun.mx/producto/brazalete-nube",
        "",
        "Total: $240.00 MXN",
        "",
        "Nombre: Ana",
        "Entrega: Envío nacional",
        "Pago: Transferencia",
        "Nota: Para regalo, por favor",
      ].join("\n"),
    );
  });

  it("omite la nota vacía y campos opcionales vacíos", () => {
    const msg = buildOrderMessage(items, { ...form, note: "   ", payment: "" }, settings, site);
    expect(msg).not.toContain("Nota:");
    expect(msg).not.toContain("Pago:");
    expect(msg.endsWith("Entrega: Envío nacional")).toBe(true);
    expect(msg).not.toMatch(/\n{3,}/);
  });

  it("formatea miles con formatPricePlain", () => {
    const msg = buildOrderMessage([{ ...items[0], price: 1250.5, quantity: 2 }], form, settings, site);
    expect(msg).toContain("— $2,501.00");
    expect(msg).toContain("Total: $2,501.00 MXN");
  });

  it("acepta siteUrl con diagonal final", () => {
    expect(buildOrderMessage(items, form, settings, `${site}/`)).toContain("https://rakuun.mx/producto/brazalete-nube");
  });

  it("quita los links si la URL pasaría de ~1800 caracteres", () => {
    const many: CartItem[] = Array.from({ length: 20 }, (_, n) => ({
      productId: `p${n}`,
      slug: `producto-con-nombre-largo-${n}`,
      name: `Producto ${n}`,
      price: 60,
      imageUrl: null,
      quantity: 1,
    }));
    const msg = buildOrderMessage(many, form, settings, site);
    expect(msg).not.toContain("https://");
    expect(msg).toContain("• 1 × Producto 19 — $60.00");
    expect(buildWhatsAppUrl(settings.whatsappNumber, msg).length).toBeLessThanOrEqual(MAX_WHATSAPP_URL_LENGTH);
  });
});

describe("buildInfoMessage", () => {
  it("lista productos sin datos del cliente", () => {
    expect(buildInfoMessage(items, settings, site)).toBe(
      [
        "¡Hola RAKUUN! 👋 Me gustaría pedir información de estos productos:",
        "",
        "• 1 × Collar estrellas colgantes — $120.00",
        "  https://rakuun.mx/producto/collar-estrellas-colgantes",
        "• 2 × Brazalete nube — $120.00",
        "  https://rakuun.mx/producto/brazalete-nube",
        "",
        "Total: $240.00 MXN",
        "",
        "¿Siguen disponibles? ¡Gracias!",
      ].join("\n"),
    );
  });
});
