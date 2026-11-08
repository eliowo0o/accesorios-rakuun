"use client";

import { useCallback, useId, useMemo, useReducer } from "react";
import { checkoutFormReducer, emptyCheckoutForm, type CheckoutField } from "@/reducers/checkoutFormReducer";
import { validateCheckout, type CheckoutValidation } from "@/lib/checkout-schema";
import type { StoreSettings } from "@/types";

const FIELD_ORDER: CheckoutField[] = ["name", "phone", "delivery", "payment", "note"];

export type CheckoutFieldIds = Record<CheckoutField, string> & { form: string };

/**
 * Estado del formulario de pedido (useReducer) + validación con errores por campo.
 * Al fallar la validación enfoca el primer campo con error.
 */
export function useCheckoutForm(settings: Pick<StoreSettings, "deliveryOptions" | "paymentMethods">) {
  const [state, dispatch] = useReducer(checkoutFormReducer, settings.deliveryOptions[0], (delivery) => ({
    values: emptyCheckoutForm(delivery ?? ""),
    errors: {},
  }));

  const baseId = useId();
  const ids = useMemo<CheckoutFieldIds>(
    () => ({
      form: `${baseId}-form`,
      name: `${baseId}-name`,
      phone: `${baseId}-phone`,
      delivery: `${baseId}-delivery`,
      payment: `${baseId}-payment`,
      note: `${baseId}-note`,
    }),
    [baseId],
  );

  const setField = useCallback((field: CheckoutField, value: string) => dispatch({ type: "CHANGE", field, value }), []);

  const { deliveryOptions, paymentMethods } = settings;
  const validate = useCallback((): CheckoutValidation => {
    const result = validateCheckout(state.values, { deliveryOptions, paymentMethods });
    dispatch({ type: "SET_ERRORS", errors: result.success ? {} : result.errors });
    if (!result.success) {
      const first = FIELD_ORDER.find((f) => result.errors[f]);
      if (first) document.getElementById(ids[first])?.focus();
    }
    return result;
  }, [state.values, deliveryOptions, paymentMethods, ids]);

  return { values: state.values, errors: state.errors, ids, setField, validate };
}
