import { z } from "zod";
import type { CheckoutForm, StoreSettings } from "@/types";

export const NAME_MIN = 2;
export const NAME_MAX = 60;
export const NOTE_MAX = 300;

function optionField(options: readonly string[], message: string) {
  // Si el admin no configuró opciones, el campo no se exige.
  if (options.length === 0) return z.string().trim().max(80);
  return z.string({ error: message }).refine((v) => options.includes(v), { error: message });
}

/** Esquema del formulario de pedido. Las opciones de entrega/pago vienen de los ajustes. */
export function createCheckoutSchema(settings: Pick<StoreSettings, "deliveryOptions" | "paymentMethods">) {
  return z.object({
    name: z
      .string({ error: "Escribe tu nombre" })
      .trim()
      .min(1, { error: "Escribe tu nombre" })
      .min(NAME_MIN, { error: `Tu nombre debe tener al menos ${NAME_MIN} letras` })
      .max(NAME_MAX, { error: `Tu nombre puede tener hasta ${NAME_MAX} caracteres` }),
    delivery: optionField(settings.deliveryOptions, "Elige cómo quieres recibir tu pedido"),
    payment: optionField(settings.paymentMethods, "Elige cómo vas a pagar"),
    note: z
      .string()
      .trim()
      .max(NOTE_MAX, { error: `La nota puede tener hasta ${NOTE_MAX} caracteres` })
      .default(""),
  });
}

export type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

export type CheckoutValidation = { success: true; data: CheckoutForm } | { success: false; errors: CheckoutErrors };

/** Valida y devuelve datos limpios o el primer error de cada campo. */
export function validateCheckout(
  values: CheckoutForm,
  settings: Pick<StoreSettings, "deliveryOptions" | "paymentMethods">,
): CheckoutValidation {
  const result = createCheckoutSchema(settings).safeParse(values);
  if (result.success) return { success: true, data: result.data };
  const errors: CheckoutErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof CheckoutForm | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { success: false, errors };
}
