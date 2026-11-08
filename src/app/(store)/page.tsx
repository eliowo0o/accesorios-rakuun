import type { Metadata } from "next";
import { EmptyState } from "@/components/molecules/EmptyState";
import { JsonLd } from "@/components/molecules/JsonLd";
import { SearchBar } from "@/components/molecules/SearchBar";
import { CategoryBar } from "@/components/organisms/CategoryBar";
import { Hero } from "@/components/organisms/Hero";
import { ProductGrid } from "@/components/organisms/ProductGrid";
import { CatalogTemplate } from "@/components/templates/CatalogTemplate";
import { buildMetadata, storeJsonLd } from "@/lib/seo";
import { routes } from "@/lib/site";
import { getAllProducts, getCategoryTree, getStoreSettings } from "@/services/catalog";
import { buildCategoryLookup, productCategoryLabel } from "./_lib/catalog";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  return buildMetadata({
    absoluteTitle: `${settings.storeName} · Accesorios hechos a mano`,
    description: `Collares, pulseras, aretes y más accesorios hechos a mano por ${settings.storeName}${settings.location ? ` en ${settings.location}` : ""}. ${settings.tagline}.`,
    path: routes.home(),
    image: settings.heroImageUrl ? { url: settings.heroImageUrl, alt: settings.storeName } : null,
    siteName: settings.storeName,
  });
}

export default async function HomePage() {
  const [settings, tree, products] = await Promise.all([getStoreSettings(), getCategoryTree(), getAllProducts()]);
  const lookup = buildCategoryLookup(tree);

  return (
    <>
      <JsonLd data={storeJsonLd(settings)} />
      <CatalogTemplate
        hero={<Hero settings={settings} targetId="productos" />}
        search={<SearchBar />}
        nav={<CategoryBar tree={tree} totalCount={products.length} activeSlug={null} />}
        sectionLabel="Todos los productos"
      >
        <h2 className="sr-only">Productos</h2>
        <ProductGrid
          products={products}
          labelFor={(p) => productCategoryLabel(p, lookup)}
          headingLevel="h3"
          empty={<EmptyState title="Pronto habrá productos aquí" />}
        />
      </CatalogTemplate>
    </>
  );
}
