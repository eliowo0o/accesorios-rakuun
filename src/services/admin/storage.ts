import "server-only";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { createPresignedUpload, deleteObjectByUrl, isS3Configured } from "@/lib/s3";
import { isProduction } from "./config";
import { EXTENSION_BY_TYPE, type UploadRequest } from "./schemas";

/**
 * Almacenamiento de imágenes del admin. S3 si está configurado; si no, y NUNCA en producción,
 * un fallback local que guarda en public/uploads-dev/ (gitignored).
 * El flujo del navegador es el mismo en ambos casos: PUT a `uploadUrl`, guardar `publicUrl`.
 */

export const DEV_UPLOADS_PUBLIC_PREFIX = "/uploads-dev/";
export const DEV_UPLOADS_ROUTE_PREFIX = "/admin/uploads-dev/";
const DEV_DIR = path.join(process.cwd(), "public", "uploads-dev");
const DEV_FILE_PATTERN = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;

export function canUseDevUploads(): boolean {
  return !isProduction() && !isS3Configured();
}

export type UploadTarget = { uploadUrl: string; publicUrl: string };

export async function createUploadTarget(input: UploadRequest): Promise<UploadTarget> {
  if (isS3Configured()) return createPresignedUpload(input);
  if (!canUseDevUploads()) throw new Error("Falta configurar S3.");
  const file = `${crypto.randomUUID()}.${EXTENSION_BY_TYPE[input.contentType]}`;
  return { uploadUrl: `${DEV_UPLOADS_ROUTE_PREFIX}${file}`, publicUrl: `${DEV_UPLOADS_PUBLIC_PREFIX}${file}` };
}

export function isValidDevFileName(file: string): boolean {
  return DEV_FILE_PATTERN.test(file);
}

export async function saveDevUpload(file: string, bytes: Uint8Array): Promise<void> {
  if (!canUseDevUploads() || !isValidDevFileName(file)) throw new Error("Subida local no permitida.");
  await mkdir(DEV_DIR, { recursive: true });
  await writeFile(path.join(DEV_DIR, file), bytes);
}

async function deleteDevUpload(url: string): Promise<void> {
  if (!canUseDevUploads() || !url.startsWith(DEV_UPLOADS_PUBLIC_PREFIX)) return;
  const file = url.slice(DEV_UPLOADS_PUBLIC_PREFIX.length);
  if (!isValidDevFileName(file)) return;
  await unlink(path.join(DEV_DIR, file)).catch(() => undefined);
}

/**
 * Borra los archivos de estas URLs (S3 o local de desarrollo). Ignora URLs ajenas ("/mock/…").
 * No lanza: si falla un borrado, solo se registra (el dato en BD ya se guardó).
 */
export async function deleteStoredImages(urls: string[]): Promise<void> {
  await Promise.all(
    urls.map(async (url) => {
      try {
        if (isS3Configured()) await deleteObjectByUrl(url);
        else await deleteDevUpload(url);
      } catch (error) {
        console.error("[admin/storage] No se pudo borrar", url, error);
      }
    }),
  );
}
