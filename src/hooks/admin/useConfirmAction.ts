"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "@/services/admin/types";

/**
 * Acción destructiva con confirmación nativa (funciona bien en celular).
 * Guarda el error devuelto por la Server Action para mostrarlo.
 */
export function useConfirmAction<Args extends unknown[]>(action: (...args: Args) => Promise<ActionResult | void>) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (message: string, ...args: Args) => {
    if (!window.confirm(message)) return;
    setError(null);
    startTransition(async () => {
      const result = await action(...args);
      if (result && !result.ok) setError(result.error);
    });
  };

  return { run, pending, error, clearError: () => setError(null) };
}
