"use client"; // Los error boundaries deben ser Client Components.

import { RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { useReportError } from "@/hooks/useReportError";

/**
 * Error inesperado en una página de la tienda (p. ej. la base de datos no respondió).
 * `retry()` vuelve a pedir los datos y a renderizar el segmento (Next 16).
 */
export default function StoreError({ error, retry }: { error: unknown; retry: () => void }) {
  useReportError(error);
  return (
    <section role="alert" className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary">
        <TriangleAlert aria-hidden className="size-8" />
      </span>
      <h1 className="mt-5 font-display text-2xl font-bold text-ink">Algo salió mal</h1>
      <p className="mt-2 text-muted">No pudimos cargar esta página. Revisa tu conexión e inténtalo de nuevo.</p>
      <Button className="mt-6" onClick={() => retry()}>
        <RotateCw aria-hidden className="size-4" />
        Reintentar
      </Button>
    </section>
  );
}
