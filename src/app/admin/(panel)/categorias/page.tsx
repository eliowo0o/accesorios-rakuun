import { Suspense } from "react";
import { CategoryTree } from "@/components/organisms/admin/CategoryTree";
import { AdminPage, AdminPageSkeleton } from "@/components/templates/admin/AdminPage";
import { getAdminCategoryTree } from "@/services/admin/data";

export const metadata = { title: "Categorías" };

async function Tree() {
  return <CategoryTree tree={await getAdminCategoryTree()} />;
}

export default function AdminCategoriesPage() {
  return (
    <AdminPage
      title="Categorías"
      description="Categorías principales y sus subcategorías. Solo se puede borrar una categoría vacía."
    >
      <Suspense fallback={<AdminPageSkeleton />}>
        <Tree />
      </Suspense>
    </AdminPage>
  );
}
