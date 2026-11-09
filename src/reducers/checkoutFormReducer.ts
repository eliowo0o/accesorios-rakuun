import type { CheckoutForm } from "@/types";
import type { CheckoutErrors } from "@/lib/checkout-schema";

/** Estado del formulario "Tu pedido": valores + errores por campo. Reducer puro. */
export interface CheckoutFormState {
  values: CheckoutForm;
  errors: CheckoutErrors;
}

export type CheckoutField = keyof CheckoutForm;

export type CheckoutFormAction =
  | { type: "CHANGE"; field: CheckoutField; value: string }
  | { type: "SET_ERRORS"; errors: CheckoutErrors }
  | { type: "RESET"; values: CheckoutForm };

export function emptyCheckoutForm(defaultDelivery = ""): CheckoutForm {
  return { name: "", delivery: defaultDelivery, payment: "", note: "" };
}

export function checkoutFormReducer(state: CheckoutFormState, action: CheckoutFormAction): CheckoutFormState {
  switch (action.type) {
    case "CHANGE": {
      if (state.values[action.field] === action.value) return state;
      // Al corregir un campo se borra su error (se vuelve a validar al enviar).
      const { [action.field]: _removed, ...errors } = state.errors;
      void _removed;
      return { values: { ...state.values, [action.field]: action.value }, errors };
    }
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    case "RESET":
      return { values: action.values, errors: {} };
    default:
      return state;
  }
}
