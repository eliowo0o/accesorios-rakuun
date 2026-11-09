import "server-only";
import { getPublicSupabase, hasSupabaseEnv } from "@/lib/supabase/public";
import { devRecord } from "./dev-store";
import type { Json } from "@/types/database";
import type { ErrorLogInput } from "./types";

/** Convierte cualquier cosa lanzada en mensaje + stack + digest. */
export function describeError(error: unknown): { message: string; stack: string | null; digest: string | null } {
  if (error instanceof Error) {
    const digest = "digest" in error && typeof error.digest === "string" ? error.digest : null;
    return { message: error.message || error.name, stack: error.stack ?? null, digest };
  }
  return { message: typeof error === "string" ? error : JSON.stringify(error) ?? "Error desconocido", stack: null, digest: null };
}

/** Errores de control de flujo de Next (notFound, redirect): no son fallas reales. */
export function isNextControlFlow(digest: string | null | undefined): boolean {
  return Boolean(digest && (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK") || digest === "NEXT_NOT_FOUND"));
}

/**
 * Registra un error en `error_logs` (vía la función `public.log_error`). NUNCA lanza:
 * si el registro falla, solo queda en consola para no tapar el error original.
 * Sin Supabase (desarrollo) guarda en memoria.
 */
export async function logError(input: ErrorLogInput): Promise<void> {
  console.error(`[${input.source}] ${input.message}`, input.path ?? "");
  if (isNextControlFlow(input.digest)) return;
  try {
    if (!hasSupabaseEnv()) {
      devRecord(input);
      return;
    }
    const { error } = await getPublicSupabase().rpc("log_error", {
      p_source: input.source,
      p_message: input.message,
      p_level: input.level ?? "error",
      p_digest: input.digest ?? null,
      p_stack: input.stack ?? null,
      p_path: input.path ?? null,
      p_route: input.route ?? null,
      p_context: (input.context ?? {}) as Json,
      p_user_agent: input.userAgent ?? null,
    });
    if (error) console.error("[error-log] No se pudo registrar:", error.message);
  } catch (e) {
    console.error("[error-log] No se pudo registrar:", e);
  }
}
