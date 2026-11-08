"use client";

import { useCallback, useState, type FormEvent } from "react";
import { useCart } from "@/hooks/useCart";
import { useCheckoutForm } from "@/hooks/useCheckoutForm";
import { buildInfoMessage, buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { SITE_URL } from "@/lib/site";
import type { CartItem, StoreSettings } from "@/types";

function openWhatsApp(number: string, message: string) {
  window.open(buildWhatsAppUrl(number, message), "_blank", "noopener");
}

/**
 * Checkout del carrito: formulario + envío por WhatsApp.
 * - submitOrder: valida (nombre, celular, entrega, pago, nota) y abre wa.me con el pedido.
 * - requestInfo: abre wa.me preguntando por los productos, sin exigir datos.
 * - orderSent: true tras enviar el pedido, mientras el carrito no cambie; se ofrece vaciarlo
 *   (no se vacía solo: la persona puede volver si WhatsApp no se abrió).
 */
export function useCheckout(settings: StoreSettings) {
  const { items, clear } = useCart();
  const form = useCheckoutForm(settings);
  const { validate } = form;
  // Los items que se enviaron. Cualquier cambio del carrito crea otro arreglo y oculta la confirmación.
  const [sentItems, setSentItems] = useState<CartItem[] | null>(null);
  const orderSent = sentItems !== null && sentItems === items;

  const submitOrder = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      if (items.length === 0) return;
      const result = validate();
      if (!result.success) return;
      openWhatsApp(settings.whatsappNumber, buildOrderMessage(items, result.data, settings, SITE_URL));
      setSentItems(items);
    },
    [items, validate, settings],
  );

  const requestInfo = useCallback(() => {
    if (items.length === 0) return;
    openWhatsApp(settings.whatsappNumber, buildInfoMessage(items, settings, SITE_URL));
  }, [items, settings]);

  const clearCart = useCallback(() => {
    clear();
    setSentItems(null);
  }, [clear]);

  return {
    values: form.values,
    errors: form.errors,
    ids: form.ids,
    setField: form.setField,
    submitOrder,
    requestInfo,
    orderSent,
    clearCart,
  };
}
