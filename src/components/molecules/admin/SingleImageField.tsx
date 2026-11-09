import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Label } from "@/components/atoms/Label";
import type { ImageUploadController } from "@/hooks/admin/useImageUpload";
import { ImageUploader } from "./ImageUploader";

/** Campo de una sola imagen (opcional) que viaja en el form como input oculto con la URL. */
export function SingleImageField({
  id,
  name,
  label,
  alt,
  url,
  uploader,
  onClear,
  error,
}: {
  id: string;
  name: string;
  label: string;
  alt: string;
  url: string | null;
  uploader: Pick<ImageUploadController, "items" | "notice" | "onInputChange" | "dismiss">;
  onClear: () => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <input type="hidden" name={name} value={url ?? ""} />
      {url && (
        <div className="flex items-center gap-3">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
            <Image src={url} alt={alt} fill sizes="80px" className="object-cover" />
          </div>
          <Button variant="outline" onClick={onClear}>
            <Trash2 aria-hidden className="size-4" />
            Quitar imagen
          </Button>
        </div>
      )}
      <ImageUploader
        id={id}
        label={url ? "Cambiar imagen" : "Subir imagen"}
        multiple={false}
        items={uploader.items}
        notice={uploader.notice}
        onInputChange={uploader.onInputChange}
        onDismiss={uploader.dismiss}
      />
      {error && <p role="alert" data-field-error className="text-sm text-danger">{error}</p>}
    </div>
  );
}
