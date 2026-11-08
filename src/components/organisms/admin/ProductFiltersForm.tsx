import Link from "next/link";
import { Button, buttonClass } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { ADMIN_ROUTES } from "@/services/admin/config";
import type { AdminCategoryNode, ProductFilters } from "@/services/admin/types";

const FLAG_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "si", label: "Sí" },
  { value: "no", label: "No" },
];

function FlagSelect({ id, label, value }: { id: string; label: string; value?: string }) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="mb-1 text-xs font-medium text-muted">
        {label}
      </label>
      <Select id={id} name={id} defaultValue={value ?? ""} className="h-11 text-sm">
        {FLAG_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

/** Filtros por GET (?q=&categoria=&visible=&agotado=&destacado=): funcionan sin JavaScript. Server Component. */
export function ProductFiltersForm({ tree, filters }: { tree: AdminCategoryNode[]; filters: ProductFilters }) {
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
          <Select id="categoria" name="categoria" defaultValue={filters.categoryId ?? ""} className="h-11 text-sm">
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
        <FlagSelect id="visible" label="Visible" value={filters.visible} />
        <FlagSelect id="agotado" label="Agotado" value={filters.soldOut} />
        <FlagSelect id="destacado" label="Destacado" value={filters.featured} />
      </div>
      <div className="flex gap-2">
        <Button type="submit">Filtrar</Button>
        <Link href={ADMIN_ROUTES.products} className={buttonClass({ variant: "ghost", className: "text-muted" })}>
          Limpiar
        </Link>
      </div>
    </form>
  );
}
