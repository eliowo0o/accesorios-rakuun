import type { BreadcrumbItem } from "@/lib/seo";
import { routes } from "@/lib/site";
import type { CategoryRef, CategoryWithChildren, Product } from "@/types";

/**
 * Helpers puros de la tienda (sin I/O): navegación por el árbol de categorías,
 * etiquetas de tarjeta y migas de pan.
 */

export interface CategoryLookup {
  /** slug → nombre de cualquier categoría (raíz o subcategoría). */
  names: Record<string, string>;
  /** slug → id. */
  ids: Record<string, string>;
}

export function buildCategoryLookup(tree: CategoryWithChildren[]): CategoryLookup {
  const names: Record<string, string> = {};
  const ids: Record<string, string> = {};
  for (const root of tree) {
    names[root.slug] = root.name;
    ids[root.slug] = root.id;
    for (const child of root.children) {
      names[child.slug] = child.name;
      ids[child.slug] = child.id;
    }
  }
  return { names, ids };
}

/** Slug de la categoría raíz a la que pertenece una referencia. */
export function rootSlugOf(ref: CategoryRef): string {
  return ref.parentSlug ?? ref.slug;
}

/** Etiqueta de la tarjeta: nombre de la categoría raíz de la primera categoría del producto. */
export function productCategoryLabel(product: Product, lookup: CategoryLookup): string | null {
  const first = product.categories[0];
  if (!first) return null;
  return lookup.names[rootSlugOf(first)] ?? first.name;
}

/** URL pública de una categoría a partir de su referencia. */
export function categoryHref(ref: CategoryRef): string {
  return ref.parentSlug ? routes.subcategory(ref.parentSlug, ref.slug) : routes.category(ref.slug);
}

/** Busca la raíz que contiene una subcategoría por slug. */
export function findParentOf(tree: CategoryWithChildren[], childSlug: string): CategoryWithChildren | null {
  return tree.find((root) => root.children.some((c) => c.slug === childSlug)) ?? null;
}


const HOME: BreadcrumbItem = { name: "Inicio", href: routes.home() };

export function categoryBreadcrumbs(root: { name: string; slug: string }, sub?: { name: string; slug: string }): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [HOME, { name: root.name, href: routes.category(root.slug) }];
  if (sub) items.push({ name: sub.name, href: routes.subcategory(root.slug, sub.slug) });
  return items;
}

/** Inicio › Categoría raíz › Subcategoría › Producto (según la primera categoría del producto). */
export function productBreadcrumbs(product: Product, lookup: CategoryLookup): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [HOME];
  const first = product.categories[0];
  if (first) {
    const rootSlug = rootSlugOf(first);
    items.push({ name: lookup.names[rootSlug] ?? first.name, href: routes.category(rootSlug) });
    if (first.parentSlug) items.push({ name: first.name, href: routes.subcategory(first.parentSlug, first.slug) });
  }
  items.push({ name: product.name, href: routes.product(product.slug) });
  return items;
}

/** Productos relacionados: misma categoría, sin el actual, primero los disponibles. */
export function pickRelated(candidates: Product[], current: Product, limit = 4): Product[] {
  return candidates
    .filter((p) => p.id !== current.id)
    .sort((a, b) => Number(a.isSoldOut) - Number(b.isSoldOut))
    .slice(0, limit);
}

/** Dentro de una categoría raíz, la etiqueta más útil es la subcategoría del producto. */
export function labelWithinRoot(product: Product, root: { slug: string; name: string }): string {
  return product.categories.find((c) => c.parentSlug === root.slug)?.name ?? root.name;
}
