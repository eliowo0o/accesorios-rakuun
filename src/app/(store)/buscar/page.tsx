import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/atoms";
import { EmptyState } from "@/components/molecules/EmptyState";
import { SearchBar } from "@/components/molecules/SearchBar";
import { CategoryBar } from "@/components/organisms/CategoryBar";
import { ProductGrid } from "@/components/organisms/ProductGrid";
import { CatalogTemplate } from "@/components/templates/CatalogTemplate";
import { pluralize } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";
import { getAllProducts, getCategoryTree, searchProducts } from "@/services/catalog";
import { buildCategoryLookup, productCategoryLabel } from "../_lib/catalog";

type SearchParams = PageProps<"/buscar">["searchParams"];

/** Normaliza ?q= (puede venir repetido o vacío). */
async function readQuery(searchParams: SearchParams): Promise<string> {
  const { q } = await searchParams;
  return (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 100) ?? "";
}

export async function generateMetadata({ searchParams }: PageProps<"/buscar">): Promise<Metadata> {
  const q = await readQuery(searchParams);
  return buildMetadata({
    title: q ? `Resultados para “${q}”` : "Buscar",
    description: q ? `Accesorios hechos a mano que coinciden con “${q}”.` : "Busca collares, pulseras, aretes y más accesorios hechos a mano.",
    path: routes.search(q || undefined),
    noindex: !q,
  });
}

export default async function SearchPage({ searchParams }: PageProps<"/buscar">) {
  const [tree, all] = await Promise.all([getCategoryTree(), getAllProducts()]);
  return (
    <CatalogTemplate
      search={
        <Suspense fallback={<SearchBar />}>
          {readQuery(searchParams).then((q) => (
            <SearchBar key={q} defaultQuery={q} />
          ))}
        </Suspense>
      }
      nav={<CategoryBar tree={tree} totalCount={all.length} activeSlug={null} />}
      sectionLabel="Resultados de búsqueda"
    >
      <Suspense fallback={<ResultsSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </CatalogTemplate>
  );
}

async function Results({ searchParams }: { searchParams: SearchParams }) {
  const q = await readQuery(searchParams);
  if (!q) {
    return (
      <>
        <h1 className="font-display text-2xl font-extrabold text-brand-plum">Buscar</h1>
        <p className="mt-1 text-muted">Escribe qué buscas: collar, perlas, estrella…</p>
      </>
    );
  }
  const [products, tree] = await Promise.all([searchProducts(q), getCategoryTree()]);
  const lookup = buildCategoryLookup(tree);
  return (
    <>
      <h1 className="font-display text-2xl font-extrabold text-brand-plum">Resultados para “{q}”</h1>
      <p className="mb-5 mt-1 text-sm font-medium text-muted" aria-live="polite">
        {pluralize(products.length, "producto encontrado", "productos encontrados")}
      </p>
      <ProductGrid
        products={products}
        labelFor={(p) => productCategoryLabel(p, lookup)}
        empty={
          <EmptyState title="No encontramos productos">
            Prueba con otra palabra o explora las categorías.
          </EmptyState>
        }
      />
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div aria-hidden className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="h-8 w-56 sm:col-span-2 lg:col-span-3" />
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="aspect-[4/3] sm:aspect-[4/5]" />
      ))}
    </div>
  );
}
