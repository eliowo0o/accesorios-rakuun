import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ImageOff } from "lucide-react";
import { Badge, Button, Input, Price, Select } from "@/components/atoms";
import { ADMIN_ROUTES } from "@/services/admin/config";
import type { AdminCategory, AdminCategoryNode, AdminProduct, ProductFilters } from "@/services/admin/types";

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

const FLAG_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "si", label: "Sí" },
  { value: "no", label: "No" },
];

/** Filtros por GET (?q=&categoria=&visible=&agotado=&destacado=): funcionan sin JavaScript. */
export function ProductFiltersForm({ tree, filters }: { tree: AdminCategoryNode[]; filters: ProductFilters }) {
  const flag = (id: string, name: string, label: string, value?: string) => (
    <div className="flex flex-col">
      <label htmlFor={id} className="mb-1 text-xs font-medium text-muted">
        {label}
      </label>
      <Select id={id} name={name} defaultValue={value ?? ""} className="h-10 text-sm">
        {FLAG_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );

  return (
    <form method="get" role="search" className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-white p-3">
      <label htmlFor="q" className="sr-only">
        Buscar productos
      </label>
      <Input id="q" name="q" type="search" placeholder="Buscar por nombre…" defaultValue={filters.q ?? ""} className="h-11" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="col-span-2 flex flex-col sm:col-span-1">
          <label htmlFor="categoria" className="mb-1 text-xs font-medium text-muted">
            Categoría
          </label>
          <Select id="categoria" name="categoria" defaultValue={filters.categoryId ?? ""} className="h-10 text-sm">
            <option value="">Todas</option>
            {tree.map((root) => (
              <optgroup key={root.id} label={root.name}>
                <option value={root.id}>{root.name} (todas)</option>
                {root.children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </div>
        {flag("visible", "visible", "Visible", filters.visible)}
        {flag("agotado", "agotado", "Agotado", filters.soldOut)}
        {flag("destacado", "destacado", "Destacado", filters.featured)}
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Filtrar
        </Button>
        <Link href={ADMIN_ROUTES.products} className="inline-flex h-9 items-center rounded-full px-3 font-display text-sm font-semibold text-muted hover:bg-gray-100">
          Limpiar
        </Link>
      </div>
    </form>
  );
}
