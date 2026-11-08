import Link from "next/link";
import { SearchX } from "lucide-react";
import { routes } from "@/lib/site";

/** Contenido de la página 404 (compartido por la tienda y el 404 global). */
export function NotFoundContent() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary">
        <SearchX aria-hidden className="size-8" />
      </span>
      <h1 className="mt-5 font-display text-2xl font-bold text-ink">No encontramos esta página</h1>
      <p className="mt-2 text-muted">
        Puede que el producto ya no esté disponible o que el enlace haya cambiado. Mira lo que tenemos ahora en el catálogo.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href={routes.home()}
          className="inline-flex h-11 items-center rounded-full bg-primary px-5 font-display text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Ver productos
        </Link>
        <Link
          href={routes.search()}
          className="inline-flex h-11 items-center rounded-full border border-line px-5 font-display text-sm font-semibold text-ink transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Buscar
        </Link>
      </div>
    </section>
  );
}
