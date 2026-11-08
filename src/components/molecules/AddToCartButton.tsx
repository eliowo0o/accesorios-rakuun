"use client";

import { Check, Minus, Plus } from "lucide-react";
import { Button, type ButtonProps, IconButton } from "@/components/atoms";
import { useAddToCart } from "@/hooks/useAddToCart";
import { cn } from "@/lib/cn";
import type { CartItem } from "@/types";

type Snapshot = Omit<CartItem, "quantity">;

interface AddToCartButtonProps extends Pick<ButtonProps, "variant" | "size" | "fullWidth" | "className"> {
  item: Snapshot;
  /** Texto del botón; por defecto "Agregar". */
  label?: string;
}

/** Botón "+ Agregar" de la tarjeta: agrega 1 y muestra "Agregado" un momento. */
export function AddToCartButton({ item, label = "Agregar", variant = "light", size = "sm", fullWidth, className }: AddToCartButtonProps) {
  const { add, added } = useAddToCart(item);
  return (
    <AddButton
      added={added}
      onClick={add}
      label={label}
      name={item.name}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={className}
    />
  );
}

/** Cantidad + botón de agregar (página de producto). */
export function AddToCartWithQuantity({ item }: { item: Snapshot }) {
  const { quantity, increment, decrement, canDecrement, canIncrement, add, added } = useAddToCart(item);
  return (
    <div className="flex items-center gap-3">
      <div role="group" aria-label="Cantidad" className="flex shrink-0 items-center gap-1 rounded-full bg-gray-100 p-1">
        <IconButton label="Quitar uno" variant="ghost" onClick={decrement} disabled={!canDecrement} className="hover:bg-white">
          <Minus aria-hidden className="size-4" />
        </IconButton>
        <output aria-live="polite" aria-label={`Cantidad: ${quantity}`} className="w-8 text-center font-display text-base font-bold tabular-nums">
          {quantity}
        </output>
        <IconButton label="Agregar uno" variant="ghost" onClick={increment} disabled={!canIncrement} className="hover:bg-white">
          <Plus aria-hidden className="size-4" />
        </IconButton>
      </div>
      <AddButton added={added} onClick={add} label="Agregar al carrito" name={item.name} variant="primary" size="lg" fullWidth className="min-w-0 px-4 whitespace-nowrap" />
    </div>
  );
}

function AddButton({
  added,
  onClick,
  label,
  name,
  ...buttonProps
}: { added: boolean; onClick: () => void; label: string; name: string } & Pick<ButtonProps, "variant" | "size" | "fullWidth" | "className">) {
  return (
    <>
      <Button
        {...buttonProps}
        onClick={onClick}
        aria-label={added ? `${name} agregado al carrito` : `${label}: ${name}`}
        className={cn("min-h-11 relative z-10", added && "bg-primary text-white hover:bg-primary", buttonProps.className)}
      >
        {added ? <Check aria-hidden className="size-4" /> : <Plus aria-hidden className="size-4" />}
        {added ? "Agregado" : label}
      </Button>
      <span aria-live="polite" className="sr-only">
        {added ? `${name} se agregó al carrito` : ""}
      </span>
    </>
  );
}
