"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { logError } from "@/lib/error-log/logger";

/**
 * Reporta un error que pasó en el navegador (error boundaries). Es pública a propósito:
 * los errores también ocurren en la tienda sin sesión. Se valida y recorta todo aquí y
 * otra vez en `public.log_error`, que además limita a 60 errores nuevos por minuto.
 */
const clientErrorSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  digest: z.string().max(100).nullish(),
  stack: z.string().max(8000).nullish(),
  path: z.string().max(500).nullish(),
});

export async function reportClientError(input: z.input<typeof clientErrorSchema>): Promise<void> {
  const parsed = clientErrorSchema.safeParse(input);
  if (!parsed.success) return;
  const ua = (await headers()).get("user-agent");
  await logError({
    source: "client",
    message: parsed.data.message,
    digest: parsed.data.digest ?? null,
    stack: parsed.data.stack ?? null,
    path: parsed.data.path ?? null,
    userAgent: ua,
  });
}
