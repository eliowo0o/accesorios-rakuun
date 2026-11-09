"use client"; // Reemplaza al layout raíz cuando falla: debe traer su propio <html>/<body>.

import { useReportError } from "@/hooks/useReportError";
import "./globals.css";

export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useReportError(error);
  return (
    <html lang="es-MX">
      <body className="flex min-h-dvh items-center justify-center bg-white p-6 text-center">
        <main role="alert" className="max-w-md">
          <h1 className="font-display text-2xl font-bold text-ink">Algo salió mal</h1>
          <p className="mt-2 text-muted">Tuvimos un problema al cargar la página. Inténtalo de nuevo en un momento.</p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-6 inline-flex h-11 cursor-pointer items-center rounded-full bg-primary px-5 font-semibold text-white"
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
