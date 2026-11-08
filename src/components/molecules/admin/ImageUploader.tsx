import type { ChangeEventHandler } from "react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { IconButton } from "@/components/atoms/IconButton";
import type { UploadItem } from "@/hooks/admin/imageUploadReducer";
import { cn } from "@/lib/cn";

const ACCEPT = "image/jpeg,image/png,image/webp";

/**
 * Botón para elegir imágenes + cola de subida con progreso. Sin lógica: recibe el estado
 * y el handler `onInputChange` de useImageUpload. En celular abre la galería/cámara.
 */
export function ImageUploader({
  id,
  label = "Subir imágenes",
  items,
  notice,
  onInputChange,
  onDismiss,
  multiple = true,
  disabled,
}: {
  id: string;
  label?: string;
  items: UploadItem[];
  /** Aviso del último lote (p. ej. "Máximo 8 imágenes…"). */
  notice?: string | null;
  onInputChange: ChangeEventHandler<HTMLInputElement>;
  onDismiss: (id: string) => void;
  multiple?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className={cn(
          "flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-gray-50 px-4 py-3",
          "font-display text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft",
          "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <ImagePlus aria-hidden className="size-5" />
        {label}
        <input id={id} type="file" accept={ACCEPT} multiple={multiple} disabled={disabled} className="sr-only" onChange={onInputChange} />
      </label>
      <p className="text-xs text-muted">JPG, PNG o WebP · máximo 5 MB cada una.</p>
      <p role="status" className={cn("text-sm text-danger", !notice && "sr-only")}>
        {notice}
      </p>

      {items.length > 0 && (
        <ul className="flex flex-col gap-2" aria-live="polite">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white px-3 py-2">
              {item.status === "error" ? null : <LoaderCircle aria-hidden className="size-4 shrink-0 animate-spin text-primary" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{item.name}</p>
                {item.status === "error" ? (
                  <p className="text-xs text-danger">{item.error}</p>
                ) : (
                  <div
                    role="progressbar"
                    aria-label={`Subiendo ${item.name}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={item.progress}
                    className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100"
                  >
                    <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${item.progress}%` }} />
                  </div>
                )}
              </div>
              {item.status === "error" && (
                <IconButton label={`Descartar ${item.name}`} onClick={() => onDismiss(item.id)} className="shrink-0">
                  <X aria-hidden className="size-4" />
                </IconButton>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
