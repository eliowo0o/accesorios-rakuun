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
        <li key={image.key} className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-2">
          <div className="flex items-center gap-2">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
              <Image src={image.url} alt={image.alt || fallbackAlt} fill sizes="64px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              {index === 0 ? <Badge className="w-fit">Portada</Badge> : <span className="text-sm text-muted">Imagen {index + 1}</span>}
            </div>
            <div className="flex shrink-0 gap-1">
              <IconButton label={`Subir imagen ${index + 1}`} disabled={index === 0} onClick={() => onMoveUp(index)}>
                <ArrowUp aria-hidden className="size-4" />
              </IconButton>
              <IconButton label={`Bajar imagen ${index + 1}`} disabled={index === images.length - 1} onClick={() => onMoveDown(index)}>
                <ArrowDown aria-hidden className="size-4" />
              </IconButton>
              <IconButton label={`Quitar imagen ${index + 1}`} onClick={() => onRemove(index)} className="text-danger">
                <X aria-hidden className="size-4" />
              </IconButton>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted" htmlFor={`img-alt-${image.key}`}>
              Descripción de la imagen {index + 1} (ayuda a Google y a lectores de pantalla)
            </label>
            <Input
              id={`img-alt-${image.key}`}
              value={image.alt}
              placeholder={fallbackAlt || "Describe la imagen"}
              maxLength={200}
              className="h-11 text-sm"
              onChange={(e) => onAltChange(index, e.target.value)}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
