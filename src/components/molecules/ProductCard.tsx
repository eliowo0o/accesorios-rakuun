import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import { Price } from "@/components/atoms/Price";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/site";
import type { Product } from "@/types";
import { AddToCartButton } from "./AddToCartButton";
import { ImagePlaceholder } from "./ImagePlaceholder";

interface ProductCardProps {
  product: Product;
  /** Nombre de la categoría que se muestra arriba del nombre (p. ej. "Collares"). */
  categoryLabel?: string | null;
  /**
   * Carga de la foto: "preload" solo para la tarjeta que es el LCP de la página,
   * "eager" para las de la primera fila (arriba del pliegue), "lazy" para el resto.
   */
  imagePriority?: "preload" | "eager" | "lazy";
  /** `sizes` de la imagen según la rejilla donde vive la tarjeta. */
  sizes?: string;
  /** Nivel del encabezado del nombre (h2 en listados de página, h3 bajo una sección). */
  headingLevel?: "h2" | "h3";
  /** "wide": tarjeta ancha (listados); "compact": rejilla de 2 columnas en móvil (relacionados). */
  variant?: "wide" | "compact";
}

/**
 * Tarjeta de producto (Server Component): foto completa, degradado y texto encima.
 * Toda la tarjeta es clicable (link estirado sobre el nombre); el botón "Agregar" queda por encima.
 */
export function ProductCard({
  product,
  categoryLabel,
  imagePriority = "lazy",
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  headingLevel: Heading = "h2",
  variant = "wide",
}: ProductCardProps) {
  const compact = variant === "compact";
  const cover = product.images[0];
  const href = routes.product(product.slug);
  return (
    <article
      className={cn(
        "group relative isolate flex flex-col justify-end overflow-hidden rounded-card bg-gray-100 shadow-sm ring-1 ring-black/5",
        "transition-shadow duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-primary",
        compact ? "aspect-[3/4]" : "aspect-[4/3] sm:aspect-[4/5]",
      )}
    >
      {cover ? (
        <Image
          src={cover.url}
          alt={cover.alt || product.name}
          fill
          sizes={sizes}
          preload={imagePriority === "preload"}
          loading={imagePriority === "lazy" ? "lazy" : "eager"}
          className="-z-10 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 -z-10">
          <ImagePlaceholder label={product.name} />
        </div>
      )}

      {/* Degradado para que el texto blanco tenga contraste sobre cualquier foto. */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-3/4 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

      {product.isSoldOut ? (
        <Badge tone="dark" className="absolute left-4 top-4 bg-ink/85 px-3 py-1">
          Agotado
        </Badge>
      ) : null}

      {/* Sin posicionar: así el link estirado (::after) cubre toda la tarjeta. */}
      <div className={cn("flex gap-3", compact ? "flex-col p-3" : "items-end justify-between p-4 sm:p-5")}>
        <div className="min-w-0 text-white">
          {categoryLabel ? (
            <p className="font-display text-xs font-semibold uppercase tracking-wider text-white/85">{categoryLabel}</p>
          ) : null}
          <Heading className={cn("mt-0.5 line-clamp-2 font-display font-bold leading-tight", compact ? "text-base" : "text-xl")}>
            <Link
              href={href}
              className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline"
            >
              {product.name}
            </Link>
          </Heading>
          <Price value={product.price} className={cn("mt-1 block text-white", compact ? "text-sm" : "text-lg")} />
        </div>
        {product.isSoldOut ? null : (
          <AddToCartButton
            item={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              imageUrl: cover?.url ?? null,
            }}
            fullWidth={compact}
            className="shrink-0"
          />
        )}
      </div>
    </article>
  );
}
