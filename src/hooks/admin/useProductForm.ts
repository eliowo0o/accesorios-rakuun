"use client";

import { useCallback } from "react";
import { deleteProduct, saveProduct } from "@/services/admin/actions/products";
import { MAX_PRODUCT_IMAGES } from "@/services/admin/schemas";
import type { AdminProduct } from "@/services/admin/types";
import { useAdminForm } from "./useAdminForm";
import { useConfirmAction } from "./useConfirmAction";
import { useImageUpload } from "./useImageUpload";
import { useListEditor } from "./useListEditor";
import { useSlugField } from "./useSlugField";
import { useDirtyTracker, useUnsavedChangesGuard } from "./useUnsavedChangesGuard";

export interface ImageDraft {
  key: string;
  url: string;
  alt: string;
}

/** Todo el estado del formulario de producto: nombre/slug, imágenes ordenables, guardar y borrar. */
export function useProductForm(product: AdminProduct | null) {
  const slugField = useSlugField(product?.name ?? "", product?.slug ?? "");
  const images = useListEditor<ImageDraft>(
    product?.images.map((img) => ({ key: img.id, url: img.url, alt: img.alt })) ?? [],
  );
  const { add } = images;

  const onUploaded = useCallback((url: string) => add({ key: crypto.randomUUID(), url, alt: "" }), [add]);
  const uploader = useImageUpload({
    folder: "products",
    onUploaded,
    limit: { max: MAX_PRODUCT_IMAGES, current: images.items.length },
  });

  const imagesJson = JSON.stringify(images.items.map(({ url, alt }) => ({ url, alt })));
  const canAddImages = images.items.length < MAX_PRODUCT_IMAGES;

  const dirty = useDirtyTracker(imagesJson);
  useUnsavedChangesGuard(dirty.isDirty);

  const form = useAdminForm(saveProduct, { onSuccess: dirty.markSaved });
  const remover = useConfirmAction(deleteProduct);

  const setAlt = (index: number, alt: string) => images.update(index, { ...images.items[index], alt });

  const onDelete = () => {
    if (!product) return;
    remover.run(`¿Borrar «${product.name}»? También se borran sus imágenes. No se puede deshacer.`, product.id);
  };

  return {
    slugField,
    images,
    setAlt,
    imagesJson,
    canAddImages,
    uploader,
    form,
    onFormChange: dirty.onChange,
    onDelete,
    deleting: remover.pending,
    deleteError: remover.error,
    busy: form.pending || uploader.isUploading || remover.pending,
  };
}

export type ProductFormController = ReturnType<typeof useProductForm>;
