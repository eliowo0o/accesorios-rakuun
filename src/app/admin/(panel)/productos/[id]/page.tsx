import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CircleCheck } from "lucide-react";
import { ProductForm } from "@/components/organisms/admin/ProductForm";
import { AdminPage, AdminPageSkeleton } from "@/components/templates/admin/AdminPage";
import { ADMIN_ROUTES } from "@/services/admin/config";
import { getAdminCategoryTree, getAdminProduct } from "@/services/admin/data";
import { idSchema } from "@/services/admin/schemas";

export const metadata = { title: "Editar producto" };

async function EditProduct({
  params,
  searchParams,
}: {
  params: PageProps<"/admin/productos/[id]">["params"];
  searchParams: PageProps<"/admin/productos/[id]">["searchParams"];
}) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const [product, tree, sp] = await Promise.all([getAdminProduct(id), getAdminCategoryTree(), searchParams]);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-4">
      {sp.creado === "1" && (
        <p role="status" className="flex items-center gap-2 rounded-2xl bg-primary-soft px-4 py-3 text-sm text-primary">
          <CircleCheck aria-hidden className="size-4" />
          Producto creado.
        </p>
      )}
      {/* key: si cambia el producto, el formulario arranca de cero con sus datos. */}
      <ProductForm key={product.id} product={product} tree={tree} />
    </div>
  );
}

export default function AdminEditProductPage({ params, searchParams }: PageProps<"/admin/productos/[id]">) {
  return (
    <AdminPage title="Editar producto" back={{ href: ADMIN_ROUTES.products, label: "Productos" }}>
      <Suspense fallback={<AdminPageSkeleton rows={5} />}>
        <EditProduct params={params} searchParams={searchParams} />
      </Suspense>
    </AdminPage>
  );
}
