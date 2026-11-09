import { describe, expect, it } from "vitest";
import type { CheckoutForm } from "@/types";
import { validateCheckout } from "./checkout-schema";

const settings = { deliveryOptions: ["Recojo", "Delivery", "Envío nacional"], paymentMethods: ["Efectivo", "Transferencia"] };
const valid: CheckoutForm = { name: "Ana", delivery: "Recojo", payment: "Efectivo", note: "" };

describe("validateCheckout", () => {
  it("acepta datos válidos y limpia espacios", () => {
    const r = validateCheckout({ ...valid, name: "  Ana  ", note: " hola " }, settings);
    expect(r).toEqual({ success: true, data: { ...valid, note: "hola" } });
  });

  it("exige nombre de 2 a 60 caracteres", () => {
    expect(validateCheckout({ ...valid, name: "  " }, settings)).toEqual({ success: false, errors: { name: "Escribe tu nombre" } });
    expect(validateCheckout({ ...valid, name: "A" }, settings)).toMatchObject({ errors: { name: expect.stringContaining("al menos 2") } });
    expect(validateCheckout({ ...valid, name: "A".repeat(61) }, settings)).toMatchObject({ errors: { name: expect.stringContaining("60") } });
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
    const r = validateCheckout({ name: "", delivery: "", payment: "", note: "" }, settings);
    expect(r.success).toBe(false);
    if (!r.success) expect(Object.keys(r.errors).sort()).toEqual(["delivery", "name", "payment"]);
  });
});
