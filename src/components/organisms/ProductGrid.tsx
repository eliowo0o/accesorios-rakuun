import type { ReactNode } from "react";
import { ProductCard } from "@/components/molecules/ProductCard";
import { cn } from "@/lib/cn";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  /** Devuelve la etiqueta de categoría de cada tarjeta. */
  labelFor?: (product: Product) => string | null;
  /** "first": precarga la foto de la primera tarjeta (solo si es el LCP de la página). */
  preload?: "first" | "none";
  /** Qué mostrar si no hay productos. */
  empty?: ReactNode;
  headingLevel?: "h2" | "h3";
  /** "wide": listados (1–3 columnas); "compact": 2–4 columnas (productos relacionados). */
  variant?: "wide" | "compact";
}

const GRID = {
  wide: "sm:grid-cols-2 lg:grid-cols-3 sm:gap-5",
  compact: "grid-cols-2 lg:grid-cols-4",
} as const;

const SIZES = {
  wide: "(min-width: 1024px) 352px, (min-width: 640px) 50vw, 100vw",
  compact: "(min-width: 1024px) 264px, 50vw",
} as const;

/** Lista de productos (Server Component). El orden viene del servicio: destacados primero. */
export function ProductGrid({
  products,
  labelFor,
  preload = "none",
  empty,
  headingLevel = "h2",
  variant = "wide",
}: ProductGridProps) {
  if (products.length === 0) return <>{empty}</>;
  return (
    <ul className={cn("grid gap-4", GRID[variant])}>
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            categoryLabel={labelFor?.(product) ?? null}
            preload={preload === "first" && index === 0}
            sizes={SIZES[variant]}
            headingLevel={headingLevel}
            variant={variant}
          />
        </li>
      ))}
    </ul>
  );
}
