import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/atoms/Skeleton";

/**
 * Plantilla de cada pantalla del admin.
 * <AdminPage title="Productos" actions={<…/>} back={{ href, label }}>…</AdminPage>
 */
export function AdminPage({
  title,
  description,
  actions,
  back,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  back?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        {back && (
          <Link href={back.href} className="-ml-1 inline-flex min-h-11 w-fit items-center gap-1 px-1 text-sm font-medium text-muted hover:text-ink">
            <ChevronLeft aria-hidden className="size-4" />
            {back.label}
          </Link>
        )}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

/** Fallback de <Suspense> para el contenido de una pantalla del admin. */
export function AdminPageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}
