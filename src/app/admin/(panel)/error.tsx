"use client"; // Los error boundaries deben ser Client Components.

import { CircleAlert, RotateCw } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { useReportError } from "@/hooks/useReportError";

/** Error inesperado en una pantalla del admin: mensaje en español + "Reintentar" (Next 16: prop `retry`). */
export default function AdminPanelError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = useReportError(error);

  return (
    <div role="alert" className="flex flex-col items-start gap-4 rounded-[var(--radius-card)] border border-red-200 bg-white p-5">
      <div className="flex items-start gap-2 text-danger">
        <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
        <h2 className="font-display text-lg font-bold">Algo salió mal</h2>
      </div>
      <p className="text-sm text-muted">
        No se pudo cargar esta pantalla. Revisa tu conexión e inténtalo de nuevo; tus datos guardados no se perdieron.
      </p>
      {digest && <p className="text-xs text-muted">Código: {digest}</p>}
      <Button onClick={() => retry()}>
        <RotateCw aria-hidden className="size-4" />
        Reintentar
      </Button>
    </div>
  );
}
