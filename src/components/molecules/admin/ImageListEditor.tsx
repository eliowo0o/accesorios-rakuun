import Image from "next/image";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { IconButton } from "@/components/atoms/IconButton";
import { Input } from "@/components/atoms/Input";
import type { ImageDraft } from "@/hooks/admin/useProductForm";

/** Imágenes del producto: reordenar (subir/bajar), quitar y editar el texto alternativo. La primera es portada. */
export function ImageListEditor({
  images,
  fallbackAlt,
  onAltChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  images: ImageDraft[];
  fallbackAlt: string;
  onAltChange: (index: number, alt: string) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}) {
  if (images.length === 0) return <p className="text-sm text-muted">Sin imágenes todavía.</p>;
  return (
    <ol className="flex flex-col gap-2">
      {images.map((image, index) => (
        <li key={image.key} className="flex items-center gap-2 rounded-2xl border border-line bg-white p-2">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
            <Image src={image.url} alt={image.alt || fallbackAlt} fill sizes="64px" className="object-cover" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {index === 0 && <Badge className="w-fit">Portada</Badge>}
            <label className="sr-only" htmlFor={`img-alt-${image.key}`}>
              Texto alternativo de la imagen {index + 1}
            </label>
            <Input
              id={`img-alt-${image.key}`}
              value={image.alt}
              placeholder={fallbackAlt || "Describe la imagen"}
              maxLength={200}
              className="h-10 text-sm"
              onChange={(e) => onAltChange(index, e.target.value)}
            />
          </div>
          <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
            <IconButton label={`Subir imagen ${index + 1}`} disabled={index === 0} onClick={() => onMoveUp(index)}>
              <ArrowUp aria-hidden className="size-4" />
            </IconButton>
            <IconButton label={`Bajar imagen ${index + 1}`} disabled={index === images.length - 1} onClick={() => onMoveDown(index)}>
              <ArrowDown aria-hidden className="size-4" />
            </IconButton>
          </div>
          <IconButton label={`Quitar imagen ${index + 1}`} onClick={() => onRemove(index)} className="shrink-0 text-danger">
            <X aria-hidden className="size-4" />
          </IconButton>
        </li>
      ))}
    </ol>
  );
}
