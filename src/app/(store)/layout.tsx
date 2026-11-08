import { CartProvider } from "@/context/cart/CartProvider";
import { CartSheet } from "@/components/organisms/CartSheet";
import { getStoreSettings } from "@/services/catalog";

/**
 * Layout de la tienda pública. Dueño: agente Tienda (agrega Header/Footer).
 * Debe conservar <CartProvider> envolviendo todo y <CartSheet settings={settings} /> montado una vez.
 */
export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const settings = await getStoreSettings();
  return (
    <CartProvider>
      <main className="flex-1">{children}</main>
      <CartSheet settings={settings} />
    </CartProvider>
  );
}
