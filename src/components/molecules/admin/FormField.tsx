import { useId, type ReactNode } from "react";
import { Label } from "@/components/atoms/Label";
import { cn } from "@/lib/cn";

/** Props de accesibilidad que el control debe recibir para quedar enlazado a su ayuda/error. */
export interface FieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
}

/**
 * Campo de formulario: etiqueta + control + ayuda + error, enlazados con aria-describedby/aria-invalid.
 * El hijo es una función que recibe esas props para ponérselas al control:
 * <FormField id="name" label="Nombre" error={fieldError("name")}>{(field) => <Input {...field} name="name" />}</FormField>
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
  children: (control: FieldControlProps) => ReactNode;
  className?: string;
}) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const showHint = !!hint && !error;
  const control: FieldControlProps = {
    id,
    "aria-describedby": error ? errorId : showHint ? hintId : undefined,
    "aria-invalid": error ? true : undefined,
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children(control)}
      {showHint && (
        <p id={hintId} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" data-field-error className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** Agrupa campos relacionados con un título visible (fieldset nombrado por su <h2>). */
export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  return (
    <fieldset
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className="flex min-w-0 flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-white p-4 sm:p-5"
    >
      <div>
        <h2 id={titleId} className="font-display text-base font-bold text-ink">
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="mt-0.5 text-sm text-muted">
            {description}
          </p>
        )}
      </div>
      {children}
    </fieldset>
  );
}
