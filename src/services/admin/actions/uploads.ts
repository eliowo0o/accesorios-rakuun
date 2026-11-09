"use server";

import { after } from "next/server";
import { describeError, logError } from "@/lib/error-log/logger";
import { requireAdmin } from "../auth";
import { uploadRequestSchema, type UploadRequest } from "../schemas";
import { createUploadTarget } from "../storage";

export type UploadTargetResult =
  | { ok: true; uploadUrl: string; publicUrl: string }
  | { ok: false; error: string };

/**
 * Pide una URL de subida (prefirmada de S3, 60 s). Verifica sesión ANTES de firmar
 * y valida tipo (jpeg/png/webp) y tamaño (≤ 5 MB).
 */
export async function requestImageUpload(input: UploadRequest): Promise<UploadTargetResult> {
  await requireAdmin();
  const parsed = uploadRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Archivo inválido." };
  try {
    return { ok: true, ...(await createUploadTarget(parsed.data)) };
  } catch (error) {
    const { message, stack } = describeError(error);
    after(() =>
      logError({ source: "action", message: `Preparar subida: ${message}`, stack, context: { folder: parsed.data.folder, contentType: parsed.data.contentType } }),
    );
    return { ok: false, error: error instanceof Error && error.message.startsWith("Falta") ? error.message : "No se pudo preparar la subida." };
  }
}
