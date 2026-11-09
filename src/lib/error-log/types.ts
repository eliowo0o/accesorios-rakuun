/** Tipos del registro de errores (tabla `error_logs`, migración 0005). */

export type ErrorSource = "server" | "client" | "action";
export type ErrorLevel = "error" | "warning";

/** Lo que se manda a registrar. Solo `source` y `message` son obligatorios. */
export interface ErrorLogInput {
  source: ErrorSource;
  message: string;
  level?: ErrorLevel;
  digest?: string | null;
  stack?: string | null;
  /** URL donde pasó (p. ej. /producto/collar?x=1). */
  path?: string | null;
  /** Archivo de ruta de Next (p. ej. /producto/[slug]). */
  route?: string | null;
  context?: Record<string, unknown>;
  userAgent?: string | null;
}

/** Un error registrado, como lo ve el admin. */
export interface ErrorLog {
  id: string;
  source: ErrorSource;
  level: ErrorLevel;
  message: string;
  digest: string | null;
  stack: string | null;
  path: string | null;
  route: string | null;
  context: Record<string, unknown>;
  userAgent: string | null;
  occurrences: number;
  firstSeenAt: string;
  lastSeenAt: string;
  resolved: boolean;
  resolvedAt: string | null;
}

export type ErrorLogStatus = "open" | "resolved" | "all";
