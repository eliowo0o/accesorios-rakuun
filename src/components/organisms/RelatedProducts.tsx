import type { Product } from "@/types";
import { ProductGrid } from "./ProductGrid";

interface RelatedProductsProps {
  products: Product[];
  title?: string;
  labelFor?: (product: Product) => string | null;
}

/** "También te puede gustar": productos de la misma categoría. */
export function RelatedProducts({ products, title = "También te puede gustar", labelFor }: RelatedProductsProps) {
  if (products.length === 0) return null;
  return (
    <section aria-labelledby="relacionados" className="mt-12">
      <h2 id="relacionados" className="font-display text-xl font-bold text-ink">
        {title}
      </h2>
      <div className="mt-4">
        <ProductGrid products={products} labelFor={labelFor} headingLevel="h3" compact />
      </div>
    </section>
  );
}
