import type { ErrorLog, ErrorLogInput } from "./types";

/**
 * Registro en memoria para modo desarrollo (sin Supabase). Imita a `public.log_error`:
 * agrupa por huella los errores abiertos y guarda como máximo 200.
 * Se pierde al reiniciar el servidor.
 */
const MAX = 200;
// En globalThis: instrumentation.ts y las páginas son bundles distintos y deben ver el mismo arreglo.
const store = globalThis as typeof globalThis & { __rakuunErrorLogs?: ErrorLog[] };
const logs: ErrorLog[] = (store.__rakuunErrorLogs ??= []);

export function fingerprintOf(input: Pick<ErrorLogInput, "source" | "message" | "path">): string {
  return `${input.source}|${input.message}|${(input.path ?? "").split("?")[0]}`;
}

export function devRecord(input: ErrorLogInput, now = new Date()): void {
  const fp = fingerprintOf(input);
  const open = logs.find((l) => !l.resolved && fingerprintOf(l) === fp);
  const at = now.toISOString();
  if (open) {
    open.occurrences += 1;
    open.lastSeenAt = at;
    open.path = input.path ?? open.path;
    return;
  }
  logs.unshift({
    id: crypto.randomUUID(),
    source: input.source,
    level: input.level ?? "error",
    message: input.message,
    digest: input.digest ?? null,
    stack: input.stack ?? null,
    path: input.path ?? null,
    route: input.route ?? null,
    context: input.context ?? {},
    userAgent: input.userAgent ?? null,
    occurrences: 1,
    firstSeenAt: at,
    lastSeenAt: at,
    resolved: false,
    resolvedAt: null,
  });
  logs.length = Math.min(logs.length, MAX);
}

export const devErrorStore = {
  list: () => [...logs].sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt)),
  setResolved(id: string, resolved: boolean) {
    const log = logs.find((l) => l.id === id);
    if (!log) return;
    log.resolved = resolved;
    log.resolvedAt = resolved ? new Date().toISOString() : null;
  },
  remove(id: string) {
    const i = logs.findIndex((l) => l.id === id);
    if (i >= 0) logs.splice(i, 1);
  },
  removeResolved() {
    for (let i = logs.length - 1; i >= 0; i--) if (logs[i].resolved) logs.splice(i, 1);
  },
  clear() {
    logs.length = 0;
  },
};
