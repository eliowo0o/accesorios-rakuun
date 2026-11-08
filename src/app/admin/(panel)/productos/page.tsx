import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { buttonClassFor } from "@/components/organisms/admin/buttonLink";
import { ProductFiltersForm, ProductList } from "@/components/organisms/admin/ProductList";
import { AdminPage, AdminPageSkeleton } from "@/components/templates/admin/AdminPage";
import { ADMIN_ROUTES } from "@/services/admin/config";
import { getAdminCategories, getAdminProducts } from "@/services/admin/data";
import { buildCategoryTree } from "@/services/admin/rules";
import type { ProductFilters } from "@/services/admin/types";

export const metadata = { title: "Productos" };

type SearchParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const flag = (v: string | string[] | undefined) => {
  const value = one(v);
  return value === "si" || value === "no" ? value : undefined;
};

function toFilters(sp: SearchParams): ProductFilters {
  return {
    q: one(sp.q)?.slice(0, 100),
    categoryId: one(sp.categoria),
    visible: flag(sp.visible),
    soldOut: flag(sp.agotado),
    featured: flag(sp.destacado),
  };
}

async function Products({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = toFilters(await searchParams);
  const [products, categories] = await Promise.all([getAdminProducts(filters), getAdminCategories()]);
  return (
    <div className="flex flex-col gap-4">
      <ProductFiltersForm tree={buildCategoryTree(categories)} filters={filters} />
      <p className="text-sm text-muted" aria-live="polite">
        {products.length} {products.length === 1 ? "producto" : "productos"}
      </p>
      <ProductList products={products} categories={categories} />
    </div>
  );
}

export default function AdminProductsPage({ searchParams }: PageProps<"/admin/productos">) {
  return (
    <AdminPage
      title="Productos"
      actions={
        <Link href={ADMIN_ROUTES.newProduct} className={buttonClassFor("primary")}>
          <Plus aria-hidden className="size-4" />
          Nuevo
        </Link>
      }
    >
      <Suspense fallback={<AdminPageSkeleton />}>
        <Products searchParams={searchParams} />
      </Suspense>
    </AdminPage>
  );
}
