import { formatPrice } from "@/lib/format";
import type { CartNotice } from "@/reducers/cartReducer";

/** Texto para el cliente de cada aviso de sincronización. */
export function describeCartNotice(notice: CartNotice): string {
  switch (notice.kind) {
    case "removed":
      return `Quitamos «${notice.name}» porque ya no está disponible.`;
    case "soldOut":
      return `«${notice.name}» se agotó y lo quitamos de tu pedido.`;
    case "priceChanged":
      return `«${notice.name}» cambió de precio: antes ${formatPrice(notice.oldPrice)}, ahora ${formatPrice(notice.newPrice)}.`;
  }
}
