import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { ExternalLink, LogOut } from "lucide-react";
import { Button, buttonClass } from "@/components/atoms/Button";
import { AdminNav } from "@/components/molecules/admin/AdminNav";
import { AdminNavLinks } from "@/components/molecules/admin/AdminNavLinks";
import { signOut } from "@/services/admin/actions/auth";
import { ADMIN_ROUTES } from "@/services/admin/config";

/** Marco del panel: barra superior (marca, ver tienda, cerrar sesión) + navegación + contenido. */
export function AdminShell({ children, banner }: { children: ReactNode; banner?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 pb-3 pt-3">
          <div className="flex items-center justify-between gap-2">
            <Link href={ADMIN_ROUTES.home} className="inline-flex min-h-11 items-center gap-1 font-display text-lg font-extrabold tracking-tight text-ink">
              RAKUUN <span className="font-semibold text-primary">admin</span>
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/" target="_blank" className={buttonClass({ variant: "ghost", className: "gap-1.5 px-3" })}>
                <ExternalLink aria-hidden className="size-4" />
                Ver tienda
                <span className="sr-only"> (se abre en otra pestaña)</span>
              </Link>
              <form action={signOut}>
                <Button type="submit" variant="ghost" className="min-w-11 gap-1.5 px-3">
                  <LogOut aria-hidden className="size-4" />
                  <span className="sr-only sm:not-sr-only">Cerrar sesión</span>
                </Button>
              </form>
            </div>
          </div>
          <Suspense fallback={<AdminNavLinks />}>
            <AdminNav />
          </Suspense>
        </div>
      </header>
      {banner}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 sm:py-8">{children}</main>
    </div>
  );
}

export function DevModeBanner() {
  return (
    <p className="bg-brand-ochre/20 px-4 py-2 text-center text-xs text-ink">
      Modo desarrollo: sin Supabase, los cambios viven en memoria y se pierden al reiniciar el servidor.
    </p>
  );
}
