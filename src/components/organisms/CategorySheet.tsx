"use client";

import { Menu } from "lucide-react";
import { chipClass, ChipLink } from "@/components/atoms";
import { CategoryCard } from "@/components/molecules/CategoryCard";
import { Sheet } from "@/components/molecules/Sheet";
import { useCategorySheet } from "@/hooks/useCategorySheet";
import { routes } from "@/lib/site";
import { cn } from "@/lib/cn";
import type { CategoryWithChildren } from "@/types";

interface CategorySheetProps {
  tree: CategoryWithChildren[];
  totalCount: number;
  /** Slug de la categoría raíz activa (null = "Todos"). */
  activeSlug: string | null;
  /** Slug de la subcategoría activa, si la hay. */
  activeSubSlug?: string | null;
}

/** Botón "Todas" + panel inferior con la cuadrícula de categorías y sus subcategorías. */
export function CategorySheet({ tree, totalCount, activeSlug, activeSubSlug = null }: CategorySheetProps) {
  const { isOpen, open, close, onLinkClick } = useCategorySheet();
  const withChildren = tree.filter((root) => root.children.length > 0);

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={cn(chipClass(false), "min-h-11")}
      >
        <Menu aria-hidden className="size-4" />
        Todas
      </button>

      <Sheet open={isOpen} onClose={close}>
        <Sheet.Header>
          <Sheet.Title>Categorías</Sheet.Title>
          <Sheet.Close label="Cerrar categorías" />
        </Sheet.Header>
        <Sheet.Body className="pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div onClick={onLinkClick}>
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
          </div>
        </Sheet.Body>
      </Sheet>
    </>
  );
}
