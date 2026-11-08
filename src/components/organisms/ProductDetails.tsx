import { CircleSlash } from "lucide-react";
import { Badge, ChipLink, Price } from "@/components/atoms";
import { AddToCartWithQuantity } from "@/components/molecules/AddToCartButton";
import type { Product } from "@/types";

interface ProductDetailsProps {
  product: Product;
  /** Categorías del producto como links ya resueltos. */
  categoryLinks: { name: string; href: string }[];
}

/** Columna de información del detalle: nombre, precio, categorías, descripción y compra. */
export function ProductDetails({ product, categoryLinks }: ProductDetailsProps) {
  const cover = product.images[0];
  return (
    <div className="flex flex-col gap-5">
      <div>
        {product.isSoldOut ? (
          <Badge tone="danger" className="mb-3 gap-1.5 px-3 py-1 text-sm">
            <CircleSlash aria-hidden className="size-4" />
            Agotado
          </Badge>
        ) : null}
        <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">{product.name}</h1>
        <Price value={product.price} className="mt-2 block text-2xl text-brand-plum" />
      </div>

      {categoryLinks.length > 0 ? (
        <div>
          <h2 className="sr-only">Categorías</h2>
          <ul className="flex flex-wrap gap-2">
            {categoryLinks.map((c) => (
              <li key={c.href}>
                <ChipLink href={c.href} className="min-h-11">
                  {c.name}
                </ChipLink>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {product.isSoldOut ? (
        <p className="rounded-2xl bg-gray-100 p-4 text-sm text-ink">
          Por ahora está agotado. Puedes preguntarnos por WhatsApp desde el carrito si lo volveremos a hacer.
        </p>
      ) : (
        <AddToCartWithQuantity
          item={{
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            imageUrl: cover?.url ?? null,
          }}
        />
      )}

      {product.description ? (
        <section aria-labelledby="descripcion">
          <h2 id="descripcion" className="font-display text-lg font-bold text-ink">
            Descripción
          </h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-gray-700">{product.description}</p>
        </section>
      ) : null}
    </div>
  );
}
