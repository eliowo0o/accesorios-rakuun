import { describe, expect, it } from "vitest";
import { checkoutFormReducer, emptyCheckoutForm, type CheckoutFormState } from "./checkoutFormReducer";

const base: CheckoutFormState = { values: emptyCheckoutForm("Recojo"), errors: {} };

describe("checkoutFormReducer", () => {
  it("valores iniciales con entrega por defecto", () => {
    expect(base.values).toEqual({ name: "", delivery: "Recojo", payment: "", note: "" });
  });

  it("CHANGE actualiza el campo y borra solo su error", () => {
    const withErrors = { ...base, errors: { name: "Escribe tu nombre", payment: "Elige cómo vas a pagar" } };
    const s = checkoutFormReducer(withErrors, { type: "CHANGE", field: "name", value: "Ana" });
    expect(s.values.name).toBe("Ana");
    expect(s.errors).toEqual({ payment: "Elige cómo vas a pagar" });
  });

  it("CHANGE con el mismo valor no crea estado nuevo", () => {
    expect(checkoutFormReducer(base, { type: "CHANGE", field: "delivery", value: "Recojo" })).toBe(base);
  });

  it("SET_ERRORS y RESET", () => {
    const s = checkoutFormReducer(base, { type: "SET_ERRORS", errors: { payment: "Elige cómo vas a pagar" } });
    expect(s.errors).toEqual({ payment: "Elige cómo vas a pagar" });
    const r = checkoutFormReducer({ ...s, values: { ...s.values, name: "Ana" } }, { type: "RESET", values: emptyCheckoutForm() });
    expect(r).toEqual({ values: emptyCheckoutForm(), errors: {} });
  });

  it("ignora acciones desconocidas", () => {
    // @ts-expect-error acción inválida a propósito
    expect(checkoutFormReducer(base, { type: "NOPE" })).toBe(base);
  });
});
