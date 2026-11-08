import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Checkbox grande (fácil de tocar en celular) con etiqueta y descripción opcional. */
export function CheckboxField({
  label,
  description,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string; description?: string }) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border border-line bg-white px-4 py-3", className)}>
      <input type="checkbox" className="mt-0.5 size-5 shrink-0 cursor-pointer accent-primary" {...props} />
      <span className="flex flex-col">
        <span className="text-sm font-medium text-ink">{label}</span>
        {description && <span className="text-xs text-muted">{description}</span>}
      </span>
    </label>
  );
}
