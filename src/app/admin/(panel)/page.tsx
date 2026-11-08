import { Suspense } from "react";
import { SummaryGrid } from "@/components/organisms/admin/SummaryGrid";
import { AdminPage, AdminPageSkeleton } from "@/components/templates/admin/AdminPage";
import { getAdminSummary } from "@/services/admin/data";

export const metadata = { title: "Resumen" };

async function Summary() {
  return <SummaryGrid summary={await getAdminSummary()} />;
}

export default function AdminHomePage() {
  return (
    <AdminPage title="Resumen">
      <Suspense fallback={<AdminPageSkeleton rows={3} />}>
        <Summary />
      </Suspense>
    </AdminPage>
  );
}
