import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell, DevModeBanner } from "@/components/organisms/admin/AdminShell";
import { AdminPageSkeleton } from "@/components/templates/admin/AdminPage";
import { requireAdmin } from "@/services/admin/auth";
import { getAdminMode } from "@/services/admin/config";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin RAKUUN" },
  robots: { index: false, follow: false },
};

/** Verifica la sesión (lee cookies → dentro de Suspense) antes de pintar la pantalla. */
async function AdminGate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}

export default function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AdminShell banner={getAdminMode() === "dev" ? <DevModeBanner /> : null}>
      <Suspense fallback={<AdminPageSkeleton />}>
        <AdminGate>{children}</AdminGate>
      </Suspense>
    </AdminShell>
  );
}
