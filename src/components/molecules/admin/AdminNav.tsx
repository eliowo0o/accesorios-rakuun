"use client";

import { useActivePath } from "@/hooks/admin/useActivePath";
import { AdminNavLinks } from "./AdminNavLinks";

/** Navegación con la sección actual resaltada (usePathname → va dentro de <Suspense>). */
export function AdminNav() {
  const isActive = useActivePath();
  return <AdminNavLinks isActive={isActive} />;
}
