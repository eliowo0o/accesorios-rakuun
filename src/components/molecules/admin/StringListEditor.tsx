import type { KeyboardEventHandler } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";

/** Lista editable de textos (métodos de pago, tipos de entrega). Cada valor viaja como input oculto `name`. */
export function StringListEditor({
  id,
  name,
  label,
  placeholder,
  items,
  draft,
  onDraftChange,
  onDraftKeyDown,
  onAdd,
  onRemove,
  onMoveUp,
  onMoveDown,
  error,
}: {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  items: string[];
  draft: string;
  onDraftChange: (value: string) => void;
  /** De useStringListEditor: Enter agrega sin enviar el formulario. */
  onDraftKeyDown: KeyboardEventHandler<HTMLInputElement>;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  error?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {items.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li key={item} className="flex items-center gap-1 rounded-2xl border border-line bg-white py-1 pl-4 pr-1">
              <input type="hidden" name={name} value={item} />
              <span className="min-w-0 flex-1 truncate text-sm text-ink">{item}</span>
              <IconButton label={`Subir ${item}`} disabled={index === 0} onClick={() => onMoveUp(index)}>
                <ArrowUp aria-hidden className="size-4" />
              </IconButton>
              <IconButton label={`Bajar ${item}`} disabled={index === items.length - 1} onClick={() => onMoveDown(index)}>
                <ArrowDown aria-hidden className="size-4" />
              </IconButton>
              <IconButton label={`Quitar ${item}`} onClick={() => onRemove(index)}>
                <X aria-hidden className="size-4" />
              </IconButton>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">Sin opciones todavía.</p>
      )}
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          placeholder={placeholder}
          maxLength={40}
          aria-describedby={error ? errorId : undefined}
          invalid={!!error}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={onDraftKeyDown}
        />
        <Button variant="secondary" onClick={onAdd} className="h-12 shrink-0">
          <Plus aria-hidden className="size-4" />
          Agregar
        </Button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
