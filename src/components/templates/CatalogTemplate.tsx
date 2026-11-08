import type { ReactNode } from "react";

interface CatalogTemplateProps {
  /** Portada (solo home). */
  hero?: ReactNode;
  /** Buscador. */
  search?: ReactNode;
  /** Barra de categorías (sticky). */
  nav: ReactNode;
  /** Migas de pan + título de la sección. */
  header?: ReactNode;
  /** id del bloque de productos (destino de "Ver productos"). */
  sectionId?: string;
  /** Etiqueta accesible del bloque de productos. */
  sectionLabel: string;
  children: ReactNode;
}

/** Esqueleto de las páginas de listado: home, categoría, subcategoría y búsqueda. */
export function CatalogTemplate({ hero, search, nav, header, sectionId = "productos", sectionLabel, children }: CatalogTemplateProps) {
  return (
    <>
      {hero}
      {search ? <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6">{search}</div> : null}
      {nav}
      <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        {header ? <div className="pt-4">{header}</div> : null}
        <section id={sectionId} aria-label={sectionLabel} className="scroll-mt-32 pt-5">
          {children}
        </section>
      </div>
    </>
  );
}
