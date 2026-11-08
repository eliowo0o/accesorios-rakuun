import type { ReactNode } from "react";

interface ProductTemplateProps {
  breadcrumbs: ReactNode;
  gallery: ReactNode;
  details: ReactNode;
  related?: ReactNode;
}

/** Detalle de producto: galería + información en dos columnas desde tablet, relacionados abajo. */
export function ProductTemplate({ breadcrumbs, gallery, details, related }: ProductTemplateProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
      <div className="py-2">{breadcrumbs}</div>
      <article className="grid gap-6 md:grid-cols-2 md:gap-10">
        <div className="md:sticky md:top-20 md:self-start">{gallery}</div>
        {details}
      </article>
      {related}
    </div>
  );
}
