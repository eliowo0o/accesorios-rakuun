import { CheckCircle2, Globe, Monitor, RotateCcw, Server, Trash2, Zap } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { buttonClass } from "@/components/atoms/Button";
import { formatDateTime, pluralize } from "@/lib/format";
import type { ErrorLog, ErrorSource } from "@/lib/error-log/types";
import { removeErrorLog, reopenErrorLog, resolveErrorLog } from "@/services/admin/actions/errors";

const SOURCE: Record<ErrorSource, { label: string; icon: typeof Server }> = {
  server: { label: "Servidor", icon: Server },
  client: { label: "Navegador", icon: Monitor },
  action: { label: "Acción del admin", icon: Zap },
};

/** Un error registrado. Server Component: se expande con <details> y los botones son formularios. */
export function ErrorLogItem({ log }: { log: ErrorLog }) {
  const source = SOURCE[log.source];
  const Icon = source.icon;
  const contextEntries = Object.entries(log.context).filter(([, v]) => v !== undefined && v !== null && v !== "");

  return (
    <li className="rounded-[var(--radius-card)] border border-line bg-white">
      <details className="group">
        <summary className="flex min-h-11 cursor-pointer list-none flex-col gap-2 p-4 [&::-webkit-details-marker]:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={log.resolved ? "neutral" : "danger"}>{log.resolved ? "Resuelto" : "Abierto"}</Badge>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
              <Icon aria-hidden className="size-3.5" />
              {source.label}
            </span>
            {log.occurrences > 1 && <Badge tone="soft">{pluralize(log.occurrences, "vez", "veces")}</Badge>}
          </div>
          <p className="line-clamp-2 break-words font-medium text-ink group-open:line-clamp-none">{log.message}</p>
          <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
            <span>Última vez: {formatDateTime(log.lastSeenAt)}</span>
            {log.path && (
              <span className="inline-flex min-w-0 items-center gap-1">
                <Globe aria-hidden className="size-3.5 shrink-0" />
                <span className="truncate">{log.path}</span>
              </span>
            )}
          </p>
        </summary>

        <div className="flex flex-col gap-3 border-t border-line p-4 text-sm">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
            <dt className="text-muted">Primera vez</dt>
            <dd>{formatDateTime(log.firstSeenAt)}</dd>
            {log.route && (
              <>
                <dt className="text-muted">Ruta</dt>
                <dd className="break-all">{log.route}</dd>
              </>
            )}
            {log.digest && (
              <>
                <dt className="text-muted">Código</dt>
                <dd className="break-all font-mono">{log.digest}</dd>
              </>
            )}
            {contextEntries.map(([key, value]) => (
              <div key={key} className="contents">
                <dt className="text-muted">{key}</dt>
                <dd className="break-all">{typeof value === "string" ? value : JSON.stringify(value)}</dd>
              </div>
            ))}
            {log.userAgent && (
              <>
                <dt className="text-muted">Navegador</dt>
                <dd className="break-all">{log.userAgent}</dd>
              </>
            )}
          </dl>
          {log.stack && (
            <pre className="max-h-64 overflow-auto rounded-xl bg-gray-50 p-3 text-[11px] leading-relaxed text-gray-700">{log.stack}</pre>
          )}

          <div className="flex flex-wrap gap-2">
            {log.resolved ? (
              <form action={reopenErrorLog}>
                <input type="hidden" name="id" value={log.id} />
                <button type="submit" className={buttonClass({ variant: "outline" })}>
                  <RotateCcw aria-hidden className="size-4" />
                  Reabrir
                </button>
              </form>
            ) : (
              <form action={resolveErrorLog}>
                <input type="hidden" name="id" value={log.id} />
                <button type="submit" className={buttonClass()}>
                  <CheckCircle2 aria-hidden className="size-4" />
                  Marcar como resuelto
                </button>
              </form>
            )}
            <form action={removeErrorLog}>
              <input type="hidden" name="id" value={log.id} />
              <button type="submit" className={buttonClass({ variant: "ghost", className: "text-danger" })}>
                <Trash2 aria-hidden className="size-4" />
                Borrar
              </button>
            </form>
          </div>
        </div>
      </details>
    </li>
  );
}
