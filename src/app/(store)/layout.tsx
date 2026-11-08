import { CartProvider } from "@/context/cart/CartProvider";
import { CartSheet } from "@/components/organisms/CartSheet";

/**
 * Layout de la tienda pública. Dueño: agente Tienda (agrega Header/Footer).
 * Debe conservar <CartProvider> envolviendo todo y <CartSheet /> montado una vez (agente Carrito).
 */
export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <CartProvider>
      <main className="flex-1">{children}</main>
      <CartSheet />
    </CartProvider>
  );
}
