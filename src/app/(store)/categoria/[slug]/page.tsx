import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import { EmptyState } from "@/components/molecules/EmptyState";
import { JsonLd } from "@/components/molecules/JsonLd";
import { CategoryBar } from "@/components/organisms/CategoryBar";
import { CategoryHeader } from "@/components/organisms/CategoryHeader";
import { ProductGrid } from "@/components/organisms/ProductGrid";
import { CatalogTemplate } from "@/components/templates/CatalogTemplate";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";
import { getCategoryBySlug, getCategoryTree, getProductCount, getProductsByCategory, getStoreSettings } from "@/services/catalog";
import { categoryBreadcrumbs, findParentOf, labelWithinRoot } from "../../_lib/catalog";

/** Con Cache Components hay que devolver al menos un parámetro; el placeholder termina en 404. */
const EMPTY_PLACEHOLDER = "sin-categorias";

export async function generateStaticParams() {
  const tree = await getCategoryTree();
  return tree.length ? tree.map((c) => ({ slug: c.slug })) : [{ slug: EMPTY_PLACEHOLDER }];
}

export async function generateMetadata({ params }: PageProps<"/categoria/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [category, settings] = await Promise.all([getCategoryBySlug(slug), getStoreSettings()]);
  if (!category || category.parentId) return { title: "Categoría no encontrada", robots: { index: false } };
  const products = await getProductsByCategory(category.id);
  const cover = category.imageUrl ?? products[0]?.images[0]?.url;
  return buildMetadata({
    title: category.name,
    description:
      category.description ??
      `${category.name} hechos a mano por ${settings.storeName}. ${products.length} modelos disponibles. ${settings.tagline}.`,
    path: routes.category(category.slug),
    image: cover ? { url: cover, alt: category.name } : null,
    siteName: settings.storeName,
  });
}

export default async function CategoryPage({ params }: PageProps<"/categoria/[slug]">) {
  const { slug } = await params;
  const [category, tree, totalCount] = await Promise.all([getCategoryBySlug(slug), getCategoryTree(), getProductCount()]);
  if (!category) notFound();

  // Una subcategoría pedida como raíz: redirigir a su URL canónica.
  if (category.parentId) {
    const parent = findParentOf(tree, category.slug);
    if (!parent) notFound();
    permanentRedirect(routes.subcategory(parent.slug, category.slug));
  }

  const products = await getProductsByCategory(category.id);
  const children = tree.find((root) => root.id === category.id)?.children ?? [];
  const crumbs = categoryBreadcrumbs(category);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <CatalogTemplate
        nav={<CategoryBar tree={tree} totalCount={totalCount} activeSlug={category.slug} />}
        header={
          <CategoryHeader
            title={category.name}
            description={category.description}
            count={products.length}
            breadcrumbs={<Breadcrumbs items={crumbs} />}
            subcategories={[
              { name: "Todo", href: routes.category(category.slug), active: true },
              ...children.map((child) => ({
                name: child.name,
                href: routes.subcategory(category.slug, child.slug),
                active: false,
              })),
            ]}
          />
        }
        sectionLabel={`Productos de ${category.name}`}
      >
        <ProductGrid
          products={products}
          labelFor={(p) => labelWithinRoot(p, category)}
          preload="first"
          empty={<EmptyState title={`Aún no hay productos en ${category.name}`}>Vuelve pronto o mira las demás categorías.</EmptyState>}
        />
      </CatalogTemplate>
    </>
  );
}
