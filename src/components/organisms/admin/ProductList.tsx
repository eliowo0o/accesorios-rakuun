import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ImageOff } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { Price } from "@/components/atoms/Price";
import { ADMIN_ROUTES } from "@/services/admin/config";
import type { AdminCategory, AdminProduct } from "@/services/admin/types";

/** Lista de productos del admin (incluye ocultos). Server Component. */
export function ProductList({ products, categories }: { products: AdminProduct[]; categories: AdminCategory[] }) {
  if (products.length === 0) {
    return <p className="rounded-[var(--radius-card)] border border-line bg-white p-6 text-center text-sm text-muted">No hay productos con esos filtros.</p>;
  }
  const nameOf = new Map(categories.map((c) => [c.id, c.name]));
  return (
    <ul className="flex flex-col gap-2">
      {products.map((product) => {
        const cover = product.images[0];
        return (
          <li key={product.id}>
            <Link
              href={ADMIN_ROUTES.product(product.id)}
              className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-white p-3 transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-primary"
            >
              <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                {cover ? (
                  <Image src={cover.url} alt={cover.alt || product.name} fill sizes="64px" className="object-cover" />
                ) : (
                  <ImageOff aria-hidden className="size-5 text-gray-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-semibold text-ink">{product.name}</p>
                <Price value={product.price} className="text-sm text-primary" />
                <p className="truncate text-xs text-muted">
                  {product.categoryIds.map((id) => nameOf.get(id)).filter(Boolean).join(", ") || "Sin categoría"}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {!product.isVisible && <Badge tone="neutral">Oculto</Badge>}
                  {product.isSoldOut && <Badge tone="danger">Agotado</Badge>}
                  {product.isFeatured && <Badge>Destacado</Badge>}
                </div>
              </div>
              <ChevronRight aria-hidden className="size-5 shrink-0 text-gray-400" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
