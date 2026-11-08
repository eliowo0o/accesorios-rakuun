import type { ReactNode } from "react";
import { ProductCard } from "@/components/molecules/ProductCard";
import { cn } from "@/lib/cn";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  /** Devuelve la etiqueta de categoría de cada tarjeta. */
  labelFor?: (product: Product) => string | null;
  /** Precarga la foto de la primera tarjeta (solo si es el LCP de la página). */
  preloadFirst?: boolean;
  /** Qué mostrar si no hay productos. */
  empty?: ReactNode;
  headingLevel?: "h2" | "h3";
  /** Rejilla compacta (productos relacionados). */
  compact?: boolean;
}

const SIZES = {
  default: "(min-width: 1024px) 352px, (min-width: 640px) 50vw, 100vw",
  compact: "(min-width: 1024px) 264px, 50vw",
};

/** Lista de productos (Server Component). El orden viene del servicio: destacados primero. */
export function ProductGrid({ products, labelFor, preloadFirst = false, empty, headingLevel = "h2", compact = false }: ProductGridProps) {
  if (products.length === 0) return <>{empty}</>;
  return (
    <ul className={cn("grid gap-4", compact ? "grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3 sm:gap-5")}>
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            categoryLabel={labelFor?.(product) ?? null}
            preload={preloadFirst && index === 0}
            sizes={compact ? SIZES.compact : SIZES.default}
            headingLevel={headingLevel}
            variant={compact ? "compact" : "wide"}
          />
        </li>
      ))}
    </ul>
  );
}
