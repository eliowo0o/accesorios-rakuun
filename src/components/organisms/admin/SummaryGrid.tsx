import Link from "next/link";
import { EyeOff, FolderTree, PackageX, Package, Plus, Settings, Star } from "lucide-react";
import { StatCard } from "@/components/molecules/admin/StatCard";
import { buttonClass } from "@/components/atoms/Button";
import { ADMIN_ROUTES } from "@/services/admin/config";
import type { AdminSummary } from "@/services/admin/types";

export function SummaryGrid({ summary }: { summary: AdminSummary }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Productos" value={summary.products} href={ADMIN_ROUTES.products} icon={<Package className="size-5" />} />
        <StatCard label="Ocultos" value={summary.hidden} href={`${ADMIN_ROUTES.products}?visible=no`} icon={<EyeOff className="size-5" />} />
        <StatCard label="Agotados" value={summary.soldOut} href={`${ADMIN_ROUTES.products}?agotado=si`} icon={<PackageX className="size-5" />} />
        <StatCard label="Destacados" value={summary.featured} href={`${ADMIN_ROUTES.products}?destacado=si`} icon={<Star className="size-5" />} />
        <StatCard
          label={`Categorías · ${summary.subcategories} sub`}
          value={summary.categories}
          href={ADMIN_ROUTES.categories}
          icon={<FolderTree className="size-5" />}
        />
      </div>

      <section aria-labelledby="quick-actions" className="flex flex-col gap-3">
        <h2 id="quick-actions" className="font-display text-base font-bold text-ink">
          Accesos rápidos
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link href={ADMIN_ROUTES.newProduct} className={buttonClass()}>
            <Plus aria-hidden className="size-4" />
            Nuevo producto
          </Link>
          <Link href={ADMIN_ROUTES.categories} className={buttonClass({ variant: "outline" })}>
            <FolderTree aria-hidden className="size-4" />
            Categorías
          </Link>
          <Link href={ADMIN_ROUTES.settings} className={buttonClass({ variant: "outline" })}>
            <Settings aria-hidden className="size-4" />
            Ajustes de tienda
          </Link>
        </div>
      </section>
    </div>
  );
}
