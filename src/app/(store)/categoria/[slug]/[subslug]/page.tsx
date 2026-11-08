import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import { EmptyState } from "@/components/molecules/EmptyState";
import { JsonLd } from "@/components/molecules/JsonLd";
import { CategoryBar } from "@/components/organisms/CategoryBar";
import { CategoryHeader } from "@/components/organisms/CategoryHeader";
import { ProductGrid } from "@/components/organisms/ProductGrid";
import { CatalogTemplate } from "@/components/templates/CatalogTemplate";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";
import { getAllProducts, getCategoryTree, getProductsByCategory, getStoreSettings } from "@/services/catalog";
import type { CategoryWithChildren } from "@/types";
import { categoryBreadcrumbs } from "../../../_lib/catalog";

const EMPTY_PLACEHOLDER = { slug: "sin-categorias", subslug: "sin-subcategorias" };

export async function generateStaticParams() {
  const tree = await getCategoryTree();
  const params = tree.flatMap((root) => root.children.map((child) => ({ slug: root.slug, subslug: child.slug })));
  return params.length ? params : [EMPTY_PLACEHOLDER];
}

/** La subcategoría solo existe si es hija de la categoría de la URL. */
function resolve(tree: CategoryWithChildren[], slug: string, subslug: string) {
  const parent = tree.find((root) => root.slug === slug);
  const sub = parent?.children.find((child) => child.slug === subslug);
  return parent && sub ? { parent, sub } : null;
}

export async function generateMetadata({ params }: PageProps<"/categoria/[slug]/[subslug]">): Promise<Metadata> {
  const { slug, subslug } = await params;
  const [tree, settings] = await Promise.all([getCategoryTree(), getStoreSettings()]);
  const found = resolve(tree, slug, subslug);
  if (!found) return { title: "Categoría no encontrada", robots: { index: false } };
  const { parent, sub } = found;
  const products = await getProductsByCategory(sub.id);
  const cover = sub.imageUrl ?? products[0]?.images[0]?.url;
  return buildMetadata({
    title: `${parent.name}: ${sub.name}`,
    description:
      sub.description ??
      `${parent.name} · ${sub.name} hechos a mano por ${settings.storeName}. ${products.length} modelos disponibles. ${settings.tagline}.`,
    path: routes.subcategory(parent.slug, sub.slug),
    image: cover ? { url: cover, alt: `${parent.name}: ${sub.name}` } : null,
    siteName: settings.storeName,
  });
}

export default async function SubcategoryPage({ params }: PageProps<"/categoria/[slug]/[subslug]">) {
  const { slug, subslug } = await params;
  const tree = await getCategoryTree();
  const found = resolve(tree, slug, subslug);
  if (!found) notFound();
  const { parent, sub } = found;

  const [products, all] = await Promise.all([getProductsByCategory(sub.id), getAllProducts()]);
  const crumbs = categoryBreadcrumbs(parent, sub);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <CatalogTemplate
        nav={<CategoryBar tree={tree} totalCount={all.length} activeSlug={parent.slug} activeSubSlug={sub.slug} />}
        header={
          <CategoryHeader
            title={sub.name}
            description={sub.description}
            count={products.length}
            breadcrumbs={<Breadcrumbs items={crumbs} />}
            subcategories={[
              { name: `Todo ${parent.name.toLowerCase()}`, href: routes.category(parent.slug), active: false },
              ...parent.children.map((child) => ({
                name: child.name,
                href: routes.subcategory(parent.slug, child.slug),
                active: child.id === sub.id,
              })),
            ]}
          />
        }
        sectionLabel={`Productos de ${parent.name}: ${sub.name}`}
      >
        <ProductGrid
          products={products}
          labelFor={() => parent.name}
          preloadFirst
          empty={<EmptyState title={`Aún no hay productos en ${sub.name}`}>Mira todo lo de {parent.name}.</EmptyState>}
        />
      </CatalogTemplate>
    </>
  );
}
