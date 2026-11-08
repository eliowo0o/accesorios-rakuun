import { ChipLink } from "@/components/atoms/Chip";
import { CategoryCard } from "@/components/molecules/CategoryCard";
import { routes } from "@/lib/site";
import type { CategoryWithChildren } from "@/types";

interface CategoryGridProps {
  tree: CategoryWithChildren[];
  totalCount: number;
  /** Slug de la categoría raíz activa (null = "Todos"). */
  activeSlug: string | null;
  /** Slug de la subcategoría activa, si la hay. */
  activeSubSlug?: string | null;
}

/** Cuadrícula de categorías raíz + subcategorías (Server Component, contenido de CategorySheet). */
export function CategoryGrid({ tree, totalCount, activeSlug, activeSubSlug = null }: CategoryGridProps) {
  const withChildren = tree.filter((root) => root.children.length > 0);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3">
        <li>
          <CategoryCard href={routes.home()} name="Todos" count={totalCount} active={activeSlug === null} />
        </li>
        {tree.map((root) => (
          <li key={root.id}>
            <CategoryCard
              href={routes.category(root.slug)}
              name={root.name}
              count={root.productCount}
              active={root.slug === activeSlug && !activeSubSlug}
            />
          </li>
        ))}
      </ul>

      {withChildren.length > 0 ? (
        <div className="mt-6 space-y-5">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">Subcategorías</h3>
          {withChildren.map((root) => (
            <section key={root.id} aria-labelledby={`sub-${root.id}`}>
              <h4 id={`sub-${root.id}`} className="font-display text-base font-bold text-ink">
                {root.name}
              </h4>
              <ul className="mt-2 flex flex-wrap gap-2">
                {root.children.map((child) => (
                  <li key={child.id}>
                    <ChipLink
                      href={routes.subcategory(root.slug, child.slug)}
                      active={child.slug === activeSubSlug}
                      className="min-h-11"
                    >
                      {child.name}
                      <span className="font-medium">({child.productCount})</span>
                    </ChipLink>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : null}
    </>
  );
}
