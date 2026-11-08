"use client";

import { useCallback, type FormEvent } from "react";
import { useCart } from "@/hooks/useCart";
import { useCheckoutForm } from "@/hooks/useCheckoutForm";
import { buildInfoMessage, buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { SITE_URL } from "@/lib/site";
import type { StoreSettings } from "@/types";

function openWhatsApp(number: string, message: string) {
  window.open(buildWhatsAppUrl(number, message), "_blank", "noopener");
}

/**
 * Checkout del carrito: formulario + envío por WhatsApp.
 * - submitOrder: valida (nombre, celular, entrega, pago, nota) y abre wa.me con el pedido.
 * - requestInfo: abre wa.me preguntando por los productos, sin exigir datos.
 */
export function useCheckout(settings: StoreSettings) {
  const { items } = useCart();
  const form = useCheckoutForm(settings);
  const { validate } = form;

  const submitOrder = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      if (items.length === 0) return;
      const result = validate();
      if (!result.success) return;
      openWhatsApp(settings.whatsappNumber, buildOrderMessage(items, result.data, settings, SITE_URL));
    },
    [items, validate, settings],
  );

  const requestInfo = useCallback(() => {
    if (items.length === 0) return;
    openWhatsApp(settings.whatsappNumber, buildInfoMessage(items, settings, SITE_URL));
  }, [items, settings]);

  return {
    values: form.values,
    errors: form.errors,
    ids: form.ids,
    setField: form.setField,
    submitOrder,
    requestInfo,
  };
}
