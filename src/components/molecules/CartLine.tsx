import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import { IconButton, Price } from "@/components/atoms";
import { QuantityStepper } from "@/components/molecules/QuantityStepper";
import { MAX_QUANTITY, MIN_QUANTITY } from "@/reducers/cartReducer";
import { routes } from "@/lib/site";
import type { CartItem } from "@/types";

export interface CartLineProps {
  item: CartItem;
  onDecrement: () => void;
  onIncrement: () => void;
  onRemove: () => void;
  /** Al seguir el link al producto (p. ej. cerrar el carrito). */
  onNavigate?: () => void;
}

/** Línea del carrito: miniatura, nombre (link), precio unitario, cantidad y quitar. */
export function CartLine({ item, onDecrement, onIncrement, onRemove, onNavigate }: CartLineProps) {
  return (
    <li className="flex items-center gap-3 border-b border-line py-3 last:border-b-0">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
        ) : (
          <ShoppingBag aria-hidden className="absolute inset-0 m-auto size-6 text-gray-400" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <Link
          href={routes.product(item.slug)}
          onClick={onNavigate}
          className="line-clamp-2 font-display text-sm font-semibold text-ink hover:underline focus-visible:outline-2 focus-visible:outline-primary"
        >
          {item.name}
        </Link>
        <Price value={item.price} className="mt-0.5 block text-sm font-medium text-gray-500" />
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center">
        <QuantityStepper
          value={item.quantity}
          min={MIN_QUANTITY}
          max={MAX_QUANTITY}
          itemLabel={item.name}
          onDecrement={onDecrement}
          onIncrement={onIncrement}
        />
        <IconButton label={`Quitar ${item.name} del pedido`} onClick={onRemove} className="text-gray-500 hover:text-danger">
          <Trash2 className="size-4" aria-hidden />
        </IconButton>
      </div>
    </li>
  );
}
