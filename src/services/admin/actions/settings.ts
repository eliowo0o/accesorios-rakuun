"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/services/catalog";
import { fromError, invalid } from "../action-helpers";
import { requireAdmin } from "../auth";
import { getAdminRepository } from "../data";
import { removedUrls } from "../rules";
import { parseSettingsForm } from "../schemas";
import { deleteStoredImages } from "../storage";
import type { ActionResult, ActionState } from "../types";

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = parseSettingsForm(formData);
  if (!parsed.success) return invalid(parsed.error);

  const repo = getAdminRepository();
  try {
    const previous = await repo.getSettings();
    const saved = await repo.updateSettings(parsed.data);
    updateTag(CACHE_TAGS.settings);
    await deleteStoredImages(
      removedUrls([previous.heroImageUrl, previous.logoUrl], [saved.heroImageUrl, saved.logoUrl]),
    );
    return { ok: true, message: "Ajustes guardados." };
  } catch (error) {
    return fromError(error);
  }
}
