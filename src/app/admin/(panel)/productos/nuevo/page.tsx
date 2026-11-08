import { Suspense } from "react";
import { ProductForm } from "@/components/organisms/admin/ProductForm";
import { AdminPage, AdminPageSkeleton } from "@/components/templates/admin/AdminPage";
import { ADMIN_ROUTES } from "@/services/admin/config";
import { getAdminCategoryTree } from "@/services/admin/data";

export const metadata = { title: "Nuevo producto" };

async function NewProductForm() {
  return <ProductForm product={null} tree={await getAdminCategoryTree()} />;
}

export default function AdminNewProductPage() {
  return (
    <AdminPage title="Nuevo producto" back={{ href: ADMIN_ROUTES.products, label: "Productos" }}>
      <Suspense fallback={<AdminPageSkeleton rows={5} />}>
        <NewProductForm />
      </Suspense>
    </AdminPage>
  );
}
