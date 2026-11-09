"use server";

import { revalidatePath } from "next/cache";
import { ADMIN_ROUTES } from "../config";
import { requireAdmin } from "../auth";
import { deleteErrorLog, deleteResolvedErrorLogs, setErrorResolved } from "../errors";
import { idSchema } from "../schemas";

/** Acciones de /admin/errores. Se usan como `action` de formularios (funcionan sin JS). */

function idFrom(formData: FormData): string | null {
  const parsed = idSchema.safeParse(formData.get("id"));
  return parsed.success ? parsed.data : null;
}

export async function resolveErrorLog(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idFrom(formData);
  if (!id) return;
  await setErrorResolved(id, true);
  revalidatePath(ADMIN_ROUTES.errors);
}

export async function reopenErrorLog(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idFrom(formData);
  if (!id) return;
  await setErrorResolved(id, false);
  revalidatePath(ADMIN_ROUTES.errors);
}

export async function removeErrorLog(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idFrom(formData);
  if (!id) return;
  await deleteErrorLog(id);
  revalidatePath(ADMIN_ROUTES.errors);
}

export async function clearResolvedErrorLogs(): Promise<void> {
  await requireAdmin();
  await deleteResolvedErrorLogs();
  revalidatePath(ADMIN_ROUTES.errors);
}
