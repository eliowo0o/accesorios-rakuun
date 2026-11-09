import { Suspense } from "react";
import { SummaryGrid } from "@/components/organisms/admin/SummaryGrid";
import { AdminPage, AdminPageSkeleton } from "@/components/templates/admin/AdminPage";
import { getAdminSummary } from "@/services/admin/data";
import { countOpenErrors } from "@/services/admin/errors";

export const metadata = { title: "Resumen" };

async function Summary() {
  const [summary, openErrors] = await Promise.all([getAdminSummary(), countOpenErrors()]);
  return <SummaryGrid summary={summary} openErrors={openErrors} />;
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
