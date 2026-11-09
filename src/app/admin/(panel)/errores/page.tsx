import { Suspense } from "react";
import { ErrorLogList } from "@/components/organisms/admin/ErrorLogList";
import { AdminPage, AdminPageSkeleton } from "@/components/templates/admin/AdminPage";
import { getErrorLogs, parseErrorStatus } from "@/services/admin/errors";

export const metadata = { title: "Errores" };

async function Errors({ searchParams }: { searchParams: PageProps<"/admin/errores">["searchParams"] }) {
  const status = parseErrorStatus((await searchParams).estado);
  return <ErrorLogList logs={await getErrorLogs(status)} status={status} />;
}

export default function AdminErrorsPage({ searchParams }: PageProps<"/admin/errores">) {
  return (
    <AdminPage
      title="Errores"
      description="Fallas que han pasado en la tienda o en el admin. Los repetidos se agrupan. Toca uno para ver el detalle."
    >
      <Suspense fallback={<AdminPageSkeleton rows={4} />}>
        <Errors searchParams={searchParams} />
      </Suspense>
    </AdminPage>
  );
}
