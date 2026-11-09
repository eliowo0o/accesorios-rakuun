import "server-only";
import { devErrorStore } from "@/lib/error-log/dev-store";
import type { ErrorLog, ErrorLogStatus } from "@/lib/error-log/types";
import { createClient } from "@/lib/supabase/server";
import type { ErrorLogRow } from "@/types/database";
import { requireAdmin } from "./auth";
import { getAdminMode } from "./config";

/** Cuántos se muestran por pantalla (los más recientes primero). */
export const ERROR_LOG_PAGE_SIZE = 100;

export function parseErrorStatus(value: string | string[] | undefined): ErrorLogStatus {
  const v = Array.isArray(value) ? value[0] : value;
  return v === "resueltos" ? "resolved" : v === "todos" ? "all" : "open";
}

export function mapErrorLog(row: ErrorLogRow): ErrorLog {
  return {
    id: row.id,
    source: row.source,
    level: row.level,
    message: row.message,
    digest: row.digest,
    stack: row.stack,
    path: row.path,
    route: row.route,
    context: row.context && typeof row.context === "object" && !Array.isArray(row.context) ? (row.context as Record<string, unknown>) : {},
    userAgent: row.user_agent,
    occurrences: row.occurrences,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    resolved: row.resolved,
    resolvedAt: row.resolved_at,
  };
}

function byStatus(status: ErrorLogStatus) {
  return (log: ErrorLog) => (status === "all" ? true : status === "resolved" ? log.resolved : !log.resolved);
}

/** Lista de errores para /admin/errores. Verifica sesión. Sin caché. */
export async function getErrorLogs(status: ErrorLogStatus): Promise<ErrorLog[]> {
  await requireAdmin();
  if (getAdminMode() !== "supabase") return devErrorStore.list().filter(byStatus(status)).slice(0, ERROR_LOG_PAGE_SIZE);

  const db = await createClient();
  let query = db.from("error_logs").select("*").order("last_seen_at", { ascending: false }).limit(ERROR_LOG_PAGE_SIZE);
  if (status !== "all") query = query.eq("resolved", status === "resolved");
  const { data, error } = await query;
  if (error) throw new Error(`Supabase (errores): ${error.message}`);
  return (data ?? []).map(mapErrorLog);
}

/** Errores sin resolver (para el resumen y el aviso del menú). */
export async function countOpenErrors(): Promise<number> {
  await requireAdmin();
  if (getAdminMode() !== "supabase") return devErrorStore.list().filter(byStatus("open")).length;
  const db = await createClient();
  const { count, error } = await db.from("error_logs").select("id", { count: "exact", head: true }).eq("resolved", false);
  if (error) return 0; // Si la tabla aún no existe, el resumen no debe romperse.
  return count ?? 0;
}

/** Escrituras (las llaman las Server Actions, que ya verificaron sesión). */
export async function setErrorResolved(id: string, resolved: boolean): Promise<void> {
  if (getAdminMode() !== "supabase") return devErrorStore.setResolved(id, resolved);
  const db = await createClient();
  const { error } = await db
    .from("error_logs")
    .update({ resolved, resolved_at: resolved ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw new Error(`Supabase (errores): ${error.message}`);
}

export async function deleteErrorLog(id: string): Promise<void> {
  if (getAdminMode() !== "supabase") return devErrorStore.remove(id);
  const db = await createClient();
  const { error } = await db.from("error_logs").delete().eq("id", id);
  if (error) throw new Error(`Supabase (errores): ${error.message}`);
}

export async function deleteResolvedErrorLogs(): Promise<void> {
  if (getAdminMode() !== "supabase") return devErrorStore.removeResolved();
  const db = await createClient();
  const { error } = await db.from("error_logs").delete().eq("resolved", true);
  if (error) throw new Error(`Supabase (errores): ${error.message}`);
}
