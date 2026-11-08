"use client";

import { saveCategory } from "@/services/admin/actions/categories";
import type { AdminCategory } from "@/services/admin/types";
import { useAdminForm } from "./useAdminForm";
import { useSingleImage } from "./useSingleImage";
import { useSlugField } from "./useSlugField";
import { useDirtyTracker, useUnsavedChangesGuard } from "./useUnsavedChangesGuard";

interface Options {
  defaultParentId: string | null;
  /** Categorías raíz posibles como padre. */
  roots: AdminCategory[];
  onDone: () => void;
}

export function useCategoryForm(category: AdminCategory | null, { defaultParentId, roots, onDone }: Options) {
  const slugField = useSlugField(category?.name ?? "", category?.slug ?? "");
  const image = useSingleImage("categories", category?.imageUrl ?? null);
  const dirty = useDirtyTracker(image.url ?? "");
  useUnsavedChangesGuard(dirty.isDirty);
  const form = useAdminForm(saveCategory, {
    onSuccess: () => {
      dirty.markSaved();
      onDone();
    },
  });

  // Ids únicos por formulario: puede haber uno de alta y otro de edición en la misma pantalla.
  const prefix = category?.id ?? `new-${defaultParentId ?? "root"}`;
  const fid = (name: string) => `${prefix}-${name}`;
  const parentOptions = roots.filter((r) => r.id !== category?.id);

  return {
    slugField,
    image,
    form,
    fid,
    parentOptions,
    onFormChange: dirty.onChange,
    busy: form.pending || image.uploader.isUploading,
  };
}
