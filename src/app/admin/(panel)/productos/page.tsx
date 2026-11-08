import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { buttonClass } from "@/components/atoms/Button";
import { ProductFiltersForm } from "@/components/organisms/admin/ProductFiltersForm";
import { ProductList } from "@/components/organisms/admin/ProductList";
import { AdminPage, AdminPageSkeleton } from "@/components/templates/admin/AdminPage";
import { pluralize } from "@/lib/format";
import { ADMIN_ROUTES } from "@/services/admin/config";
import { getAdminCategories, getAdminProducts } from "@/services/admin/data";
import { parseProductFilters, type SearchParamsRecord } from "@/services/admin/filters";
import { buildCategoryTree } from "@/services/admin/rules";

export const metadata = { title: "Productos" };

async function Products({ searchParams }: { searchParams: Promise<SearchParamsRecord> }) {
  const filters = parseProductFilters(await searchParams);
  const [products, categories] = await Promise.all([getAdminProducts(filters), getAdminCategories()]);
  return (
    <div className="flex flex-col gap-4">
      <ProductFiltersForm tree={buildCategoryTree(categories)} filters={filters} />
      <p className="text-sm text-muted" aria-live="polite">
        {pluralize(products.length, "producto", "productos")}
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
        <Link href={ADMIN_ROUTES.newProduct} className={buttonClass()}>
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
