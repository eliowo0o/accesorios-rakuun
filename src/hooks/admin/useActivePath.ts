"use client";

import { usePathname } from "next/navigation";

/** ¿El link apunta a la sección actual? "/admin" solo coincide exacto. */
export function useActivePath() {
  const pathname = usePathname();
  return (href: string) => (href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
}
