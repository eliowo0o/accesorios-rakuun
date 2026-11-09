import { CheckCircle2, Trash2 } from "lucide-react";
import { ChipLink } from "@/components/atoms/Chip";
import { buttonClass } from "@/components/atoms/Button";
import { ErrorLogItem } from "@/components/molecules/admin/ErrorLogItem";
import type { ErrorLog, ErrorLogStatus } from "@/lib/error-log/types";
import { ADMIN_ROUTES } from "@/services/admin/config";
import { clearResolvedErrorLogs } from "@/services/admin/actions/errors";

const FILTERS: { status: ErrorLogStatus; label: string; query: string }[] = [
  { status: "open", label: "Abiertos", query: "" },
  { status: "resolved", label: "Resueltos", query: "?estado=resueltos" },
  { status: "all", label: "Todos", query: "?estado=todos" },
];

/** Lista de errores con filtros. Server Component. */
export function ErrorLogList({ logs, status }: { logs: ErrorLog[]; status: ErrorLogStatus }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav aria-label="Filtrar errores" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <ChipLink key={f.status} href={`${ADMIN_ROUTES.errors}${f.query}`} active={f.status === status} className="min-h-11">
              {f.label}
            </ChipLink>
          ))}
        </nav>
        {status !== "open" && logs.some((l) => l.resolved) && (
          <form action={clearResolvedErrorLogs}>
            <button type="submit" className={buttonClass({ variant: "ghost", size: "sm", className: "min-h-11 text-danger" })}>
              <Trash2 aria-hidden className="size-4" />
              Borrar resueltos
            </button>
          </form>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-dashed border-line bg-white p-8 text-center">
          <CheckCircle2 aria-hidden className="size-8 text-primary" />
          <p className="font-medium text-ink">{status === "open" ? "Todo en orden: no hay errores abiertos." : "No hay errores aquí."}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {logs.map((log) => (
            <ErrorLogItem key={log.id} log={log} />
          ))}
        </ul>
      )}
    </div>
  );
}
