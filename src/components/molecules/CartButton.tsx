"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";

/** Botón del header que abre el carrito; muestra cuántas piezas lleva. */
export function CartButton() {
  const { count, open } = useCart();
  const label = count > 0 ? `Abrir carrito, ${count} ${count === 1 ? "producto" : "productos"}` : "Abrir carrito";
  return (
    <button
      type="button"
      onClick={open}
      aria-label={label}
      title="Carrito"
      className="relative inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-primary transition-colors duration-200 hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <ShoppingCart aria-hidden className="size-6" />
      {count > 0 ? (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1 font-display text-xs font-bold leading-5 text-white ring-2 ring-white"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}
