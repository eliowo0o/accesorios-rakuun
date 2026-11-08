"use client";

import { saveSettings } from "@/services/admin/actions/settings";
import type { SettingsData } from "@/services/admin/types";
import { useAdminForm } from "./useAdminForm";
import { useStringListEditor } from "./useListEditor";
import { useSingleImage } from "./useSingleImage";

export function useSettingsForm(settings: SettingsData) {
  const hero = useSingleImage("settings", settings.heroImageUrl);
  const logo = useSingleImage("settings", settings.logoUrl);
  const payments = useStringListEditor(settings.paymentMethods);
  const deliveries = useStringListEditor(settings.deliveryOptions);
  const form = useAdminForm(saveSettings);
  return {
    hero,
    logo,
    payments,
    deliveries,
    form,
    busy: form.pending || hero.uploader.isUploading || logo.uploader.isUploading,
  };
}
