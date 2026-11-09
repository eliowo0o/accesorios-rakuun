import type { CartItem, CheckoutForm, StoreSettings } from "@/types";
import { formatPricePlain } from "@/lib/format";
import { routes } from "@/lib/site";
import { selectTotal } from "@/reducers/cartReducer";

/**
 * Armado del mensaje de WhatsApp (funciones puras). No hay integración con la API de WhatsApp:
 * solo se abre https://wa.me/<número>?text=<mensaje>.
 * Formato: Obsidian › RAKUUN - Requerimientos tienda y carrito › "Formato del mensaje".
 */

/** Algunos clientes cortan URLs largas (~2000). Por encima de esto se quitan los links de producto. */
export const MAX_WHATSAPP_URL_LENGTH = 1800;

type MessageSettings = Pick<StoreSettings, "storeName" | "whatsappNumber">;

export function buildWhatsAppUrl(number: string, message: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

function productUrl(siteUrl: string, slug: string): string {
  return `${siteUrl.replace(/\/$/, "")}${routes.product(slug)}`;
}

function itemLines(items: CartItem[], siteUrl: string, withLinks: boolean): string[] {
  return items.flatMap((item) => {
    const line = `• ${item.quantity} × ${item.name} — ${formatPricePlain(item.price * item.quantity)}`;
    return withLinks ? [line, `  ${productUrl(siteUrl, item.slug)}`] : [line];
  });
}

function totalLine(items: CartItem[]): string {
  return `Total: ${formatPricePlain(selectTotal(items))} MXN`;
}

/** Une bloques con línea en blanco y omite líneas/bloques vacíos. */
function compose(blocks: (string | null | undefined | false)[][]): string {
  return blocks
    .map((block) => block.filter((l): l is string => typeof l === "string" && l.trim() !== "").join("\n"))
    .filter((block) => block !== "")
    .join("\n\n");
}

/** Arma con links; si la URL resultante es muy larga, vuelve a armar sin ellos. */
function fitToUrl(number: string, build: (withLinks: boolean) => string): string {
  const full = build(true);
  return buildWhatsAppUrl(number, full).length > MAX_WHATSAPP_URL_LENGTH ? build(false) : full;
}

export function buildOrderMessage(items: CartItem[], form: CheckoutForm, settings: MessageSettings, siteUrl: string): string {
  return fitToUrl(settings.whatsappNumber, (withLinks) =>
    compose([
      [`¡Hola ${settings.storeName}! 👋 Quiero hacer un pedido:`],
      itemLines(items, siteUrl, withLinks),
      [totalLine(items)],
      [
        `Nombre: ${form.name.trim()}`,
        form.delivery.trim() && `Entrega: ${form.delivery.trim()}`,
        form.payment.trim() && `Pago: ${form.payment.trim()}`,
        form.note.trim() && `Nota: ${form.note.trim()}`,
      ],
    ]),
  );
}

export function buildInfoMessage(items: CartItem[], settings: MessageSettings, siteUrl: string): string {
  return fitToUrl(settings.whatsappNumber, (withLinks) =>
    compose([
      [`¡Hola ${settings.storeName}! 👋 Me gustaría pedir información de estos productos:`],
      itemLines(items, siteUrl, withLinks),
      [totalLine(items)],
      ["¿Siguen disponibles? ¡Gracias!"],
    ]),
  );
}
