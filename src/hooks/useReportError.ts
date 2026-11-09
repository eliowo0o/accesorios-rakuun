"use client";

import { useEffect } from "react";
import { reportClientError } from "@/services/error-actions";

function digestOf(error: unknown): string | null {
  return error instanceof Error && "digest" in error && typeof error.digest === "string" ? error.digest : null;
}

/**
 * Registra en /admin/errores el error que muestra un error boundary (una vez por error).
 * Si trae `digest` es un error del servidor que ya registró `onRequestError`: no se duplica.
 * Devuelve el `digest` para mostrarlo como código de referencia.
 */
export function useReportError(error: unknown): string | null {
  const digest = digestOf(error);
  useEffect(() => {
    if (digest) return;
    const message = error instanceof Error ? error.message || error.name : String(error);
    reportClientError({
      message,
      stack: error instanceof Error ? (error.stack ?? null) : null,
      path: window.location.pathname + window.location.search,
    }).catch(() => {
      // Si ni el reporte funciona, no hay más que hacer: no romper la pantalla de error.
    });
  }, [error, digest]);
  return digest;
}
