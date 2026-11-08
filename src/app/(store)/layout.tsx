import { CartProvider } from "@/context/cart/CartProvider";
import { CartSheet } from "@/components/organisms/CartSheet";
import { Footer } from "@/components/organisms/Footer";
import { Header } from "@/components/organisms/Header";
import { getStoreSettings } from "@/services/catalog";

/**
 * Layout de la tienda pública. Dueño: agente Tienda.
 * Debe conservar <CartProvider> envolviendo todo y <CartSheet settings={settings} /> montado una vez.
 */
export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const settings = await getStoreSettings();
  return (
    <CartProvider>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-ink focus:shadow-md"
      >
        Saltar al contenido
      </a>
      <Header settings={settings} />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} />
      <CartSheet settings={settings} />
    </CartProvider>
  );
}
