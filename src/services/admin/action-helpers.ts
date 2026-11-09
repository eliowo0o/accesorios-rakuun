import "server-only";
import { after } from "next/server";
import { describeError, logError } from "@/lib/error-log/logger";
import type { z } from "zod";
import { slugify } from "@/lib/slug";
import { AdminRepoError, resolveUniqueSlug } from "./rules";
import { toFieldErrors } from "./schemas";
import type { ActionResult } from "./types";

export function invalid(error: z.ZodError): ActionResult {
  return { ok: false, error: "Hay campos con error más arriba (marcados en rojo). Corrígelos y vuelve a guardar.", fieldErrors: toFieldErrors(error) };
}

/** Convierte errores del repositorio en un resultado mostrable. Los inesperados se registran. */
export function fromError(error: unknown): ActionResult {
  if (error instanceof AdminRepoError) {
    return {
      ok: false,
      error: error.message,
      fieldErrors: error.field ? { [error.field]: [error.message] } : undefined,
    };
  }
  // Se atrapó aquí (no llega a onRequestError): registrarlo después de responder.
  const { message, stack, digest } = describeError(error);
  after(() => logError({ source: "action", message, stack, digest, context: { where: "admin action" } }));
  return { ok: false, error: "Algo salió mal. Intenta de nuevo." };
}

/** Slug desde lo escrito (o el nombre), normalizado y único (agrega "-2", "-3"… si choca). */
export async function uniqueSlugFrom(
  slugInput: string,
  name: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(slugInput || name);
  if (!base) throw new AdminRepoError("SLUG_TAKEN", "El slug necesita letras o números.", "slug");
  return resolveUniqueSlug(base, exists);
}
