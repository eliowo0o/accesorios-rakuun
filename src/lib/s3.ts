import "server-only";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  EXTENSION_BY_TYPE,
  UPLOAD_FOLDERS,
  uploadRequestSchema,
  type UploadFolder,
  type UploadRequest,
} from "@/services/admin/schemas";

/**
 * S3 (solo servidor). Las llaves AWS nunca llevan NEXT_PUBLIC_.
 * Subida: el servidor firma un PUT de 60 s con Content-Type y Content-Length fijos;
 * el navegador sube directo al bucket. En la BD se guarda la URL pública.
 */

export const PRESIGN_EXPIRES_SECONDS = 60;

interface S3Env {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
}

export function getS3Env(): S3Env | null {
  const region = process.env.AWS_REGION;
  const bucket = process.env.S3_BUCKET_NAME ?? process.env.S3_BUCKET;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const publicBaseUrl = process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL?.replace(/\/+$/, "");
  if (!region || !bucket || !accessKeyId || !secretAccessKey || !publicBaseUrl) return null;
  return { region, bucket, accessKeyId, secretAccessKey, publicBaseUrl };
}

export const isS3Configured = () => getS3Env() !== null;

let client: S3Client | null = null;
function s3(env: S3Env): S3Client {
  client ??= new S3Client({
    region: env.region,
    credentials: { accessKeyId: env.accessKeyId, secretAccessKey: env.secretAccessKey },
    // Sin esto el SDK agrega checksums CRC32 que el navegador no manda y el PUT prefirmado falla.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return client;
}

/** "products/<uuid>.webp". Nunca el nombre original del archivo. */
export function buildObjectKey(folder: UploadFolder, contentType: UploadRequest["contentType"], id: string = crypto.randomUUID()): string {
  return `${folder}/${id}.${EXTENSION_BY_TYPE[contentType]}`;
}

export function publicUrlForKey(baseUrl: string, key: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${key}`;
}

const KEY_PATTERN = new RegExp(`^(${UPLOAD_FOLDERS.join("|")})/[0-9a-f-]{36}\\.(jpg|png|webp)$`);

/**
 * Deriva la key de una URL pública del bucket. Devuelve null si la URL no es del bucket
 * (p. ej. "/mock/…", "/uploads-dev/…" u otro host) o no tiene la forma de las keys que generamos.
 */
export function keyFromPublicUrl(url: string, baseUrl: string): string | null {
  const base = `${baseUrl.replace(/\/+$/, "")}/`;
  if (!url.startsWith(base)) return null;
  const rest = url.slice(base.length).split(/[?#]/)[0];
  let key: string;
  try {
    key = decodeURIComponent(rest);
  } catch {
    return null;
  }
  return KEY_PATTERN.test(key) ? key : null;
}

export async function createPresignedUpload(input: UploadRequest): Promise<{ uploadUrl: string; publicUrl: string }> {
  const env = getS3Env();
  if (!env) throw new Error("Falta configurar S3.");
  const { contentType, size, folder } = uploadRequestSchema.parse(input);
  const key = buildObjectKey(folder, contentType);

  const command = new PutObjectCommand({
    Bucket: env.bucket,
    Key: key,
    ContentType: contentType,
    ContentLength: size,
  });
  const uploadUrl = await getSignedUrl(s3(env), command, {
    expiresIn: PRESIGN_EXPIRES_SECONDS,
    // El navegador debe mandar exactamente este Content-Type y tamaño; si no, S3 rechaza la firma.
    signableHeaders: new Set(["content-type", "content-length"]),
  });
  return { uploadUrl, publicUrl: publicUrlForKey(env.publicBaseUrl, key) };
}

/** Borra el objeto de una URL pública del bucket. Ignora (devuelve false) URLs que no son del bucket. */
export async function deleteObjectByUrl(url: string): Promise<boolean> {
  const env = getS3Env();
  if (!env) return false;
  const key = keyFromPublicUrl(url, env.publicBaseUrl);
  if (!key) return false;
  await s3(env).send(new DeleteObjectCommand({ Bucket: env.bucket, Key: key }));
  return true;
}
