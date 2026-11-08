import type { ReactNode } from "react";
import { Label } from "@/components/atoms";
import { cn } from "@/lib/cn";

/**
 * Campo de formulario: etiqueta + control + ayuda + error.
 * <FormField id="name" label="Nombre" error={fieldError("name")}><Input id="name" … /></FormField>
 */
export function FormField({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** Agrupa campos relacionados con un título (fieldset accesible). */
export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-white p-4 sm:p-5">
      <legend className="sr-only">{title}</legend>
      <div aria-hidden>
        <h2 className="font-display text-base font-bold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      {children}
    </fieldset>
  );
}
