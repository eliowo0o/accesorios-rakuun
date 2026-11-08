import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { Button, IconButton, Input, Label } from "@/components/atoms";

/** Lista editable de textos (métodos de pago, tipos de entrega). Cada valor viaja como input oculto `name`. */
export function StringListEditor({
  id,
  name,
  label,
  placeholder,
  items,
  draft,
  onDraftChange,
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
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {items.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li key={item} className="flex items-center gap-1 rounded-2xl border border-line bg-white py-1 pl-4 pr-1">
              <input type="hidden" name={name} value={item} />
              <span className="min-w-0 flex-1 truncate text-sm text-ink">{item}</span>
              <IconButton label={`Subir ${item}`} disabled={index === 0} onClick={() => onMoveUp(index)} className="size-9">
                <ArrowUp aria-hidden className="size-4" />
              </IconButton>
              <IconButton label={`Bajar ${item}`} disabled={index === items.length - 1} onClick={() => onMoveDown(index)} className="size-9">
                <ArrowDown aria-hidden className="size-4" />
              </IconButton>
              <IconButton label={`Quitar ${item}`} onClick={() => onRemove(index)} className="size-9">
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
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd();
            }
          }}
        />
        <Button variant="secondary" onClick={onAdd} className="h-12 shrink-0">
          <Plus aria-hidden className="size-4" />
          Agregar
        </Button>
      </div>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  );
}
