"use client";

import { saveSettings } from "@/services/admin/actions/settings";
import type { SettingsData } from "@/services/admin/types";
import { useAdminForm } from "./useAdminForm";
import { useStringListEditor } from "./useListEditor";
import { useSingleImage } from "./useSingleImage";
import { useDirtyTracker, useUnsavedChangesGuard } from "./useUnsavedChangesGuard";

export function useSettingsForm(settings: SettingsData) {
  const hero = useSingleImage("settings", settings.heroImageUrl);
  const logo = useSingleImage("settings", settings.logoUrl);
  const payments = useStringListEditor(settings.paymentMethods);
  const deliveries = useStringListEditor(settings.deliveryOptions);

  // Imágenes y listas no son campos nativos: se comparan por snapshot. El texto en "nuevo" (draft) también cuenta.
  const dirty = useDirtyTracker(
    JSON.stringify([hero.url, logo.url, payments.items, deliveries.items, payments.draft, deliveries.draft]),
  );
  useUnsavedChangesGuard(dirty.isDirty);

  const form = useAdminForm(saveSettings, { onSuccess: dirty.markSaved });
  return {
    hero,
    logo,
    payments,
    deliveries,
    form,
    onFormChange: dirty.onChange,
    busy: form.pending || hero.uploader.isUploading || logo.uploader.isUploading,
  };
}
