import type { ReactNode } from "react";
import { ChipLink } from "@/components/atoms/Chip";
import { pluralize } from "@/lib/format";

interface CategoryHeaderProps {
  title: string;
  description?: string | null;
  count: number;
  breadcrumbs?: ReactNode;
  /** Chips de subcategorías: el primero suele ser "Todo <categoría>". */
  subcategories?: { name: string; href: string; active: boolean }[];
}

/** Encabezado de categoría/subcategoría/búsqueda con conteo y chips de subcategorías. */
export function CategoryHeader({ title, description, count, breadcrumbs, subcategories = [] }: CategoryHeaderProps) {
  return (
    <header>
      {breadcrumbs}
      <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-brand-plum">{title}</h1>
      {description ? <p className="mt-1 max-w-2xl text-gray-700">{description}</p> : null}
      <p className="mt-1 text-sm font-medium text-muted">{pluralize(count, "producto", "productos")}</p>
      {subcategories.length > 1 ? (
        <nav aria-label={`Subcategorías de ${title}`} className="-mx-4 mt-4 sm:mx-0">
          <ul className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
            {subcategories.map((sub) => (
              <li key={sub.href} className="shrink-0">
                <ChipLink href={sub.href} active={sub.active} className="min-h-11">
                  {sub.name}
                </ChipLink>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
