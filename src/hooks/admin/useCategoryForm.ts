"use client";

import { saveCategory } from "@/services/admin/actions/categories";
import type { AdminCategory } from "@/services/admin/types";
import { useAdminForm } from "./useAdminForm";
import { useSingleImage } from "./useSingleImage";
import { useSlugField } from "./useSlugField";

export function useCategoryForm(category: AdminCategory | null, onDone: () => void) {
  const slugField = useSlugField(category?.name ?? "", category?.slug ?? "");
  const image = useSingleImage("categories", category?.imageUrl ?? null);
  const form = useAdminForm(saveCategory, { onSuccess: onDone });
  return { slugField, image, form, busy: form.pending || image.uploader.isUploading };
}
