import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider } from "@/context/cart/CartProvider";
import { CART_STORAGE_KEY, serializeCart } from "@/context/cart/cart.storage";
import { useCartActions } from "@/hooks/useCart";
import { buildInfoMessage, buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { SITE_URL } from "@/lib/site";
import type { CartProductSnapshot } from "@/reducers/cartReducer";
import type { CartItem, StoreSettings } from "@/types";
import { CartSheet } from "./CartSheet";

const syncCartProducts = vi.fn<(ids: string[]) => Promise<CartProductSnapshot[]>>();
vi.mock("@/services/cart-actions", () => ({ syncCartProducts: (ids: string[]) => syncCartProducts(ids) }));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

beforeAll(() => {
  // jsdom no implementa <dialog>.showModal()
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

const settings: StoreSettings = {
  storeName: "RAKUUN",
  tagline: "",
  heroImageUrl: null,
  logoUrl: null,
  whatsappNumber: "5215500000000",
  instagramUrl: null,
  location: null,
  paymentMethods: ["Efectivo", "Transferencia"],
  deliveryOptions: ["Recojo", "Delivery", "Envío nacional"],
};

const collar: Omit<CartItem, "quantity"> = {
  productId: "p2",
  slug: "collar-estrellas-colgantes",
  name: "Collar estrellas colgantes",
  price: 120,
  imageUrl: "/mock/collar.jpg",
};
const brazalete: Omit<CartItem, "quantity"> = { productId: "p3", slug: "brazalete-nube", name: "Brazalete nube", price: 60, imageUrl: null };

const snapshot = (i: Omit<CartItem, "quantity">, patch: Partial<CartProductSnapshot> = {}): CartProductSnapshot => ({
  productId: i.productId,
  slug: i.slug,
  name: i.name,
  price: i.price,
  imageUrl: i.imageUrl,
  isSoldOut: false,
  ...patch,
});

/** Simula los botones de la Tienda: agregar y abrir el carrito. */
function StoreButtons() {
  const { add, open } = useCartActions();
  return (
    <>
      <button onClick={() => add(collar)}>agregar collar</button>
      <button onClick={() => add(brazalete, 2)}>agregar brazalete</button>
      <button onClick={open}>abrir carrito</button>
    </>
  );
}

function setup() {
  const user = userEvent.setup();
  render(
    <CartProvider>
      <StoreButtons />
      <CartSheet settings={settings} />
    </CartProvider>,
  );
  return user;
}

function sheet() {
  return within(screen.getByRole("dialog", { hidden: true }));
}

let openSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  localStorage.clear();
  syncCartProducts.mockReset();
  syncCartProducts.mockImplementation(async (ids) => [collar, brazalete].filter((p) => ids.includes(p.productId)).map((p) => snapshot(p)));
  openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
});

afterEach(() => {
  openSpy.mockRestore();
  cleanup();
});

describe("CartSheet", () => {
  it("muestra el estado vacío y 'Ver productos' cierra", async () => {
    const user = setup();
    await user.click(screen.getByText("abrir carrito"));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Tu carrito está vacío")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Ver productos" }));
    expect(screen.getByRole("dialog", { hidden: true })).not.toHaveAttribute("open");
  });

  it("agrega productos, cambia cantidad, quita y recalcula el total", async () => {
    const user = setup();
    await user.click(screen.getByText("agregar collar"));
    await user.click(screen.getByText("abrir carrito"));

    const s = sheet();
    expect(s.getByRole("link", { name: "Collar estrellas colgantes" })).toHaveAttribute("href", "/producto/collar-estrellas-colgantes");
    expect(s.getByRole("button", { name: "Quitar uno de Collar estrellas colgantes" })).toBeDisabled();
    expect(s.getByText("(1 pieza)")).toBeInTheDocument();

    await user.click(s.getByRole("button", { name: "Agregar uno de Collar estrellas colgantes" }));
    expect(s.getByText("(2 piezas)")).toBeInTheDocument();
    expect(s.getByText("MXN $ 240,00")).toBeInTheDocument();

    await user.click(s.getByRole("button", { name: "Quitar uno de Collar estrellas colgantes" }));
    expect(s.getByText("(1 pieza)")).toBeInTheDocument();

    await user.click(s.getByRole("button", { name: "Quitar Collar estrellas colgantes del carrito" }));
    expect(s.getByText("Tu carrito está vacío")).toBeInTheDocument();
  });

  it("valida al enviar y no abre WhatsApp si faltan datos", async () => {
    const user = setup();
    await user.click(screen.getByText("agregar collar"));
    await user.click(screen.getByText("abrir carrito"));
    const s = sheet();

    await user.click(s.getByRole("button", { name: /Enviar pedido por WhatsApp/ }));

    const name = s.getByLabelText("Tu nombre");
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("Escribe tu nombre");
    expect(name).toHaveFocus();
    expect(s.getByLabelText("Tu número de celular")).toHaveAccessibleDescription("Escribe tu celular");
    expect(s.getByLabelText("¿Cómo vas a pagar?")).toHaveAccessibleDescription("Elige cómo vas a pagar");
    expect(openSpy).not.toHaveBeenCalled();

    await user.type(name, "Ana");
    expect(name).not.toHaveAttribute("aria-invalid");
  });

  it("arma la URL de wa.me con el pedido y la abre en otra pestaña", async () => {
    const user = setup();
    await user.click(screen.getByText("agregar collar"));
    await user.click(screen.getByText("agregar brazalete"));
    await user.click(screen.getByText("abrir carrito"));
    await waitFor(() => expect(syncCartProducts).toHaveBeenCalledWith(["p2", "p3"]));
    const s = sheet();

    await user.type(s.getByLabelText("Tu nombre"), "Ana");
    await user.type(s.getByLabelText("Tu número de celular"), "+52 55-1234-5678");
    await user.click(s.getByText("Envío nacional"));
    await user.selectOptions(s.getByLabelText("¿Cómo vas a pagar?"), "Transferencia");
    await user.type(s.getByLabelText(/Nota/), "Para regalo");
    await user.click(s.getByRole("button", { name: /Enviar pedido por WhatsApp/ }));

    const items = [
      { ...collar, quantity: 1 },
      { ...brazalete, quantity: 2 },
    ];
    const expected = buildWhatsAppUrl(
      "5215500000000",
      buildOrderMessage(
        items,
        { name: "Ana", phone: "5512345678", delivery: "Envío nacional", payment: "Transferencia", note: "Para regalo" },
        settings,
        SITE_URL,
      ),
    );
    expect(openSpy).toHaveBeenCalledWith(expected, "_blank", "noopener");
    const text = decodeURIComponent(new URL(expected).searchParams.get("text") ?? "");
    expect(text).toContain("Celular: 55 1234 5678");
    expect(text).toContain("Total: $240.00 MXN");

    // Confirmación + vaciar carrito.
    expect(s.getByText("Abrimos WhatsApp con tu pedido")).toBeInTheDocument();
    await user.click(s.getByRole("button", { name: "Vaciar carrito" }));
    expect(s.getByText("Tu carrito está vacío")).toBeInTheDocument();
    expect(s.queryByText("Abrimos WhatsApp con tu pedido")).not.toBeInTheDocument();
  });

  it("'Solo pedir información' abre WhatsApp sin exigir datos", async () => {
    const user = setup();
    await user.click(screen.getByText("agregar brazalete"));
    await user.click(screen.getByText("abrir carrito"));
    await user.click(sheet().getByRole("button", { name: "Solo pedir información" }));
    expect(openSpy).toHaveBeenCalledWith(
      buildWhatsAppUrl("5215500000000", buildInfoMessage([{ ...brazalete, quantity: 2 }], settings, SITE_URL)),
      "_blank",
      "noopener",
    );
    expect(sheet().queryByText("Escribe tu nombre")).not.toBeInTheDocument();
  });

  it("persiste en localStorage y lo recupera al montar", async () => {
    localStorage.setItem(CART_STORAGE_KEY, serializeCart([{ ...collar, quantity: 3 }]));
    const user = setup();
    await user.click(screen.getByText("agregar brazalete"));
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "{}")).toEqual({
        version: 1,
        items: [
          { ...collar, quantity: 3 },
          { ...brazalete, quantity: 2 },
        ],
      }),
    );
  });

  it("al abrir refresca precios y avisa si algo cambió o se quitó", async () => {
    syncCartProducts.mockResolvedValue([snapshot(collar, { price: 150 })]);
    const user = setup();
    await user.click(screen.getByText("agregar collar"));
    await user.click(screen.getByText("agregar brazalete"));
    await act(() => user.click(screen.getByText("abrir carrito")));

    const s = sheet();
    expect(await s.findByText("Actualizamos tu carrito")).toBeInTheDocument();
    expect(s.getByText(/«Collar estrellas colgantes» cambió de precio: antes MXN \$ 120,00, ahora MXN \$ 150,00/)).toBeInTheDocument();
    expect(s.getByText(/Quitamos «Brazalete nube»/)).toBeInTheDocument();
    expect(s.queryByRole("link", { name: "Brazalete nube" })).not.toBeInTheDocument();

    await user.click(s.getByRole("button", { name: "Entendido" }));
    expect(s.queryByText("Actualizamos tu carrito")).not.toBeInTheDocument();
  });
});
