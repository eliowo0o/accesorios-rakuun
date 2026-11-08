"use client";

import { Save, Trash2 } from "lucide-react";
import { Button, Input, Textarea } from "@/components/atoms";
import { CategoryPicker } from "@/components/molecules/admin/CategoryPicker";
import { CheckboxField } from "@/components/molecules/admin/CheckboxField";
import { FormField, FormSection } from "@/components/molecules/admin/FormField";
import { ErrorNote, FormMessage } from "@/components/molecules/admin/FormMessage";
import { ImageListEditor } from "@/components/molecules/admin/ImageListEditor";
import { ImageUploader } from "@/components/molecules/admin/ImageUploader";
import { useProductForm } from "@/hooks/admin/useProductForm";
import { MAX_PRODUCT_IMAGES } from "@/services/admin/schemas";
import type { AdminCategoryNode, AdminProduct } from "@/services/admin/types";

/** Formulario completo de producto (crear si `product` es null, si no editar). */
export function ProductForm({ product, tree }: { product: AdminProduct | null; tree: AdminCategoryNode[] }) {
  const { slugField, images, setAlt, imagesJson, canAddImages, uploader, form, onDelete, deleting, deleteError, busy } = useProductForm(product);
  const { fieldError } = form;

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={form.onSubmit} className="flex flex-col gap-4" noValidate>
        {product && <input type="hidden" name="id" value={product.id} />}
        <input type="hidden" name="images" value={imagesJson} />

        <FormSection title="Datos">
          <FormField id="name" label="Nombre" error={fieldError("name")}>
            <Input
              id="name"
              name="name"
              required
              maxLength={120}
              value={slugField.name}
              onChange={(e) => slugField.onNameChange(e.target.value)}
              invalid={!!fieldError("name")}
            />
          </FormField>
          <FormField id="slug" label="Slug (URL)" hint="Se genera del nombre; puedes cambiarlo. Si ya existe se le agrega un número." error={fieldError("slug")}>
            <Input
              id="slug"
              name="slug"
              maxLength={100}
              autoCapitalize="none"
              value={slugField.slug}
              onChange={(e) => slugField.onSlugChange(e.target.value)}
              onBlur={slugField.onSlugBlur}
              invalid={!!fieldError("slug")}
            />
          </FormField>
          <FormField id="price" label="Precio (MXN)" error={fieldError("price")}>
            <Input
              id="price"
              name="price"
              inputMode="decimal"
              required
              placeholder="60.00"
              defaultValue={product ? String(product.price) : ""}
              invalid={!!fieldError("price")}
            />
          </FormField>
          <FormField id="description" label="Descripción" hint="Se muestra en la ficha y en Google." error={fieldError("description")}>
            <Textarea id="description" name="description" rows={4} maxLength={2000} defaultValue={product?.description ?? ""} />
          </FormField>
        </FormSection>

        <FormSection title="Imágenes" description={`Hasta ${MAX_PRODUCT_IMAGES}. La primera es la portada.`}>
          <ImageListEditor
            images={images.items}
            fallbackAlt={slugField.name}
            onAltChange={setAlt}
            onRemove={images.remove}
            onMoveUp={images.moveUp}
            onMoveDown={images.moveDown}
          />
          {canAddImages && (
            <ImageUploader id="product-images" items={uploader.items} onFiles={uploader.addFiles} onDismiss={uploader.dismiss} />
          )}
          {fieldError("images") && <p role="alert" className="text-sm text-danger">{fieldError("images")}</p>}
        </FormSection>

        <FormSection title="Categorías">
          <CategoryPicker tree={tree} selected={product?.categoryIds ?? []} error={fieldError("categoryIds")} />
        </FormSection>

        <FormSection title="Estado">
          <div className="grid gap-2 sm:grid-cols-3">
            <CheckboxField name="isVisible" label="Visible" description="Se muestra en la tienda." defaultChecked={product?.isVisible ?? true} />
            <CheckboxField name="isSoldOut" label="Agotado" description="Se ve, pero no se puede pedir." defaultChecked={product?.isSoldOut ?? false} />
            <CheckboxField name="isFeatured" label="Destacado" description="Aparece primero y en el inicio." defaultChecked={product?.isFeatured ?? false} />
          </div>
          <FormField id="sortOrder" label="Orden" hint="Menor número = aparece primero." error={fieldError("sortOrder")} className="sm:max-w-48">
            <Input id="sortOrder" name="sortOrder" type="number" inputMode="numeric" min={0} max={9999} defaultValue={product?.sortOrder ?? 0} />
          </FormField>
        </FormSection>

        <FormMessage state={form.state} />

        <div className="sticky bottom-0 -mx-4 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
          <Button type="submit" size="lg" fullWidth disabled={busy} className="sm:w-auto">
            <Save aria-hidden className="size-5" />
            {form.pending ? "Guardando…" : uploader.isUploading ? "Subiendo imágenes…" : product ? "Guardar cambios" : "Crear producto"}
          </Button>
        </div>
      </form>

      {product && (
        <section aria-labelledby="danger-zone" className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-red-200 bg-white p-4">
          <h2 id="danger-zone" className="font-display text-base font-bold text-danger">
            Borrar producto
          </h2>
          <p className="text-sm text-muted">Se borran el producto y sus imágenes del almacenamiento. No se puede deshacer.</p>
          <ErrorNote>{deleteError}</ErrorNote>
          <Button variant="danger" onClick={onDelete} disabled={deleting} className="self-start">
            <Trash2 aria-hidden className="size-4" />
            {deleting ? "Borrando…" : "Borrar producto"}
          </Button>
        </section>
      )}
    </div>
  );
}
