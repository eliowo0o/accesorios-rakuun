import { Suspense } from "react";
import { SettingsForm } from "@/components/organisms/admin/SettingsForm";
import { AdminPage, AdminPageSkeleton } from "@/components/templates/admin/AdminPage";
import { getAdminSettings } from "@/services/admin/data";

export const metadata = { title: "Ajustes" };

async function Settings() {
  return <SettingsForm settings={await getAdminSettings()} />;
}

export default function AdminSettingsPage() {
  return (
    <AdminPage title="Ajustes de la tienda" description="Datos que se muestran en la tienda y en el mensaje de WhatsApp.">
      <Suspense fallback={<AdminPageSkeleton rows={5} />}>
        <Settings />
      </Suspense>
    </AdminPage>
  );
}
