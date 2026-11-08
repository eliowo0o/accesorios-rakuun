import { CircleAlert, CircleCheck } from "lucide-react";
import type { ActionState } from "@/services/admin/types";
import { cn } from "@/lib/cn";

/** Mensaje general del resultado de una Server Action (éxito o error). */
export function FormMessage({ state, className }: { state: ActionState; className?: string }) {
  return (
    <div aria-live="polite" className={className}>
      {state && (state.ok ? state.message : state.error) && (
        <p
          className={cn(
            "flex items-start gap-2 rounded-2xl px-4 py-3 text-sm",
            state.ok ? "bg-primary-soft text-primary" : "bg-red-50 text-danger",
          )}
        >
          {state.ok ? <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0" /> : <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />}
          {state.ok ? state.message : state.error}
        </p>
      )}
    </div>
  );
}

/** Error suelto (p. ej. al borrar). */
export function ErrorNote({ children }: { children: string | null }) {
  if (!children) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-danger">
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  );
}
