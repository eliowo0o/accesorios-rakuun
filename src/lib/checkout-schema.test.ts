import { describe, expect, it } from "vitest";
import type { CheckoutForm } from "@/types";
import { formatMxPhone, normalizeMxPhone, validateCheckout } from "./checkout-schema";

const settings = { deliveryOptions: ["Recojo", "Delivery", "Envío nacional"], paymentMethods: ["Efectivo", "Transferencia"] };
const valid: CheckoutForm = { name: "Ana", phone: "5512345678", delivery: "Recojo", payment: "Efectivo", note: "" };

describe("normalizeMxPhone", () => {
  it.each([
    ["5512345678", "5512345678"],
    ["55 1234 5678", "5512345678"],
    ["55-1234-5678", "5512345678"],
    ["(55) 1234.5678", "5512345678"],
    ["+52 55 1234 5678", "5512345678"],
    ["52 5512345678", "5512345678"],
    ["+52 1 55 1234 5678", "5512345678"],
  ])("%s → %s", (input, expected) => {
    expect(normalizeMxPhone(input)).toBe(expected);
  });

  it.each(["", "12345", "551234567", "55123456789", "55 1234 567a", "+1 555 123 4567", "+52 55 1234 567"])("rechaza %s", (input) => {
    expect(normalizeMxPhone(input)).toBeNull();
  });

  it("formatea para mostrar", () => {
    expect(formatMxPhone("5512345678")).toBe("55 1234 5678");
    expect(formatMxPhone("123")).toBe("123");
  });
});

describe("validateCheckout", () => {
  it("acepta datos válidos y normaliza", () => {
    const r = validateCheckout({ ...valid, name: "  Ana  ", phone: "+52 55-1234-5678", note: " hola " }, settings);
    expect(r).toEqual({ success: true, data: { ...valid, phone: "5512345678", note: "hola" } });
  });

  it("exige nombre de 2 a 60 caracteres", () => {
    expect(validateCheckout({ ...valid, name: "  " }, settings)).toEqual({ success: false, errors: { name: "Escribe tu nombre" } });
    expect(validateCheckout({ ...valid, name: "A" }, settings)).toMatchObject({ errors: { name: expect.stringContaining("al menos 2") } });
    expect(validateCheckout({ ...valid, name: "A".repeat(61) }, settings)).toMatchObject({ errors: { name: expect.stringContaining("60") } });
  });

  it("exige celular MX de 10 dígitos", () => {
    expect(validateCheckout({ ...valid, phone: "" }, settings)).toEqual({ success: false, errors: { phone: "Escribe tu celular" } });
    expect(validateCheckout({ ...valid, phone: "123" }, settings)).toMatchObject({ errors: { phone: expect.stringContaining("10 dígitos") } });
  });

  it("entrega y pago deben ser opciones de los ajustes", () => {
    const r = validateCheckout({ ...valid, delivery: "Dron", payment: "" }, settings);
    expect(r).toEqual({
      success: false,
      errors: { delivery: "Elige cómo quieres recibir tu pedido", payment: "Elige cómo vas a pagar" },
    });
  });

  it("si no hay opciones configuradas, entrega y pago no se exigen", () => {
    expect(validateCheckout({ ...valid, delivery: "", payment: "" }, { deliveryOptions: [], paymentMethods: [] }).success).toBe(true);
  });

  it("limita la nota a 300 caracteres", () => {
    expect(validateCheckout({ ...valid, note: "x".repeat(300) }, settings).success).toBe(true);
    expect(validateCheckout({ ...valid, note: "x".repeat(301) }, settings)).toMatchObject({ errors: { note: expect.stringContaining("300") } });
  });

  it("reporta varios campos a la vez", () => {
    const r = validateCheckout({ name: "", phone: "", delivery: "", payment: "", note: "" }, settings);
    expect(r.success).toBe(false);
    if (!r.success) expect(Object.keys(r.errors).sort()).toEqual(["delivery", "name", "payment", "phone"]);
  });
});
