import Link from "next/link";
import { FolderTree, LayoutDashboard, Package, Settings } from "lucide-react";
import { chipClass } from "@/components/atoms/Chip";
import { cn } from "@/lib/cn";
import { ADMIN_ROUTES } from "@/services/admin/config";

const LINKS = [
  { href: ADMIN_ROUTES.home, label: "Resumen", icon: LayoutDashboard },
  { href: ADMIN_ROUTES.categories, label: "Categorías", icon: FolderTree },
  { href: ADMIN_ROUTES.products, label: "Productos", icon: Package },
  { href: ADMIN_ROUTES.settings, label: "Ajustes", icon: Settings },
];

/**
 * Links del panel. Celular: 4 botones iguales (ícono arriba, texto abajo) que siempre caben a 320px.
 * Desde `sm`: chips en fila. Sin `isActive` se pinta sin resaltar (fallback).
 */
export function AdminNavLinks({ isActive }: { isActive?: (href: string) => boolean }) {
  return (
    <nav aria-label="Secciones del admin">
      <ul className="grid grid-cols-4 gap-1.5 sm:flex sm:gap-2">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = isActive?.(href) ?? false;
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined} className={cn(
                  chipClass(active),
                  "h-auto min-h-14 w-full flex-col gap-0.5 rounded-2xl px-1 py-1.5 text-[11px] leading-tight",
                  "sm:h-9 sm:min-h-11 sm:w-auto sm:flex-row sm:gap-1.5 sm:rounded-full sm:px-4 sm:py-0 sm:text-sm",
                )}
              >
                <Icon aria-hidden className="size-5 sm:size-4" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
