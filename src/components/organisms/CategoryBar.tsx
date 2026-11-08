import { ChipLink } from "@/components/atoms";
import { routes } from "@/lib/site";
import type { CategoryWithChildren } from "@/types";
import { CategorySheet } from "./CategorySheet";

interface CategoryBarProps {
  tree: CategoryWithChildren[];
  totalCount: number;
  /** Slug de la categoría raíz activa; null = "Todos". */
  activeSlug: string | null;
  activeSubSlug?: string | null;
}

/**
 * Barra de categorías fija bajo el header: botón "Todas" (abre el panel) + chip "Todos"
 * + categorías raíz con scroll horizontal. Los chips son links normales (rastreables por Google).
 */
export function CategoryBar({ tree, totalCount, activeSlug, activeSubSlug = null }: CategoryBarProps) {
  return (
    <nav aria-label="Categorías" className="sticky top-16 z-20 border-b border-line/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <ul className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
        <li className="shrink-0">
          <CategorySheet tree={tree} totalCount={totalCount} activeSlug={activeSlug} activeSubSlug={activeSubSlug} />
        </li>
        <li className="shrink-0">
          <ChipLink href={routes.home()} active={activeSlug === null} className="min-h-11">
            Todos
          </ChipLink>
        </li>
        {tree.map((root) => (
          <li key={root.id} className="shrink-0">
            <ChipLink href={routes.category(root.slug)} active={root.slug === activeSlug} className="min-h-11">
              {root.name}
            </ChipLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
