import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import { JsonLd } from "@/components/molecules/JsonLd";
import { ProductDetails } from "@/components/organisms/ProductDetails";
import { ProductGallery } from "@/components/organisms/ProductGallery";
import { RelatedProducts } from "@/components/organisms/RelatedProducts";
import { ProductTemplate } from "@/components/templates/ProductTemplate";
import { breadcrumbJsonLd, buildMetadata, productDescription, productJsonLd } from "@/lib/seo";
import { routes } from "@/lib/site";
import { getAllProducts, getCategoryTree, getProductBySlug, getProductsByCategory, getStoreSettings } from "@/services/catalog";
import {
  buildCategoryLookup,
  categoryHref,
  pickRelated,
  productBreadcrumbs,
  productCategoryLabel,
  rootSlugOf,
} from "../../_lib/catalog";

const EMPTY_PLACEHOLDER = "sin-productos";

/**
 * Navegación bloqueante a propósito (SEO): el HTML llega completo y un slug inexistente
 * responde 404 real en vez de un shell 200. Las rutas conocidas ya están prerenderizadas.
 */
export const instant = false;

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.length ? products.map((p) => ({ slug: p.slug })) : [{ slug: EMPTY_PLACEHOLDER }];
}

export async function generateMetadata({ params }: PageProps<"/producto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getStoreSettings()]);
  if (!product) return { title: "Producto no encontrado", robots: { index: false } };
  const cover = product.images[0];
  return buildMetadata({
    title: product.isSoldOut ? `${product.name} (agotado)` : product.name,
    description: productDescription(product, settings),
    path: routes.product(product.slug),
    image: cover ? { url: cover.url, alt: cover.alt || product.name } : null,
    siteName: settings.storeName,
  });
}

export default async function ProductPage({ params }: PageProps<"/producto/[slug]">) {
  const { slug } = await params;
  const [product, tree, settings] = await Promise.all([getProductBySlug(slug), getCategoryTree(), getStoreSettings()]);
  if (!product) notFound();

  const lookup = buildCategoryLookup(tree);
  const crumbs = productBreadcrumbs(product, lookup);

  // Relacionados: de la categoría raíz de su primera categoría (más variedad que la subcategoría).
  const first = product.categories[0];
  const relatedCategoryId = first ? (lookup.ids[rootSlugOf(first)] ?? first.id) : null;
  const candidates = relatedCategoryId ? await getProductsByCategory(relatedCategoryId) : [];
  const related = pickRelated(candidates, product);

  return (
    <>
      <JsonLd data={[productJsonLd(product, settings), breadcrumbJsonLd(crumbs)]} />
      <ProductTemplate
        breadcrumbs={<Breadcrumbs items={crumbs} />}
        gallery={<ProductGallery images={product.images} productName={product.name} />}
        details={
          <ProductDetails
            product={product}
            categoryLinks={product.categories.map((c) => ({ name: c.name, href: categoryHref(c) }))}
          />
        }
        related={<RelatedProducts products={related} labelFor={(p) => productCategoryLabel(p, lookup)} />}
      />
    </>
  );
}
