import Link from "next/link";
import { FolderTree, LayoutDashboard, Package, Settings } from "lucide-react";
import { chipClass } from "@/components/atoms";
import { ADMIN_ROUTES } from "@/services/admin/config";

const LINKS = [
  { href: ADMIN_ROUTES.home, label: "Resumen", icon: LayoutDashboard },
  { href: ADMIN_ROUTES.categories, label: "Categorías", icon: FolderTree },
  { href: ADMIN_ROUTES.products, label: "Productos", icon: Package },
  { href: ADMIN_ROUTES.settings, label: "Ajustes", icon: Settings },
];

/** Links del panel: chips con scroll horizontal en celular. Sin `isActive` se pinta sin resaltar (fallback). */
export function AdminNavLinks({ isActive }: { isActive?: (href: string) => boolean }) {
  return (
    <nav aria-label="Secciones del admin" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
      <ul className="flex gap-2 pb-1">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = isActive?.(href) ?? false;
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined} className={chipClass(active)}>
                <Icon aria-hidden className="size-4" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
