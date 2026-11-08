import { getAdminSession } from "@/services/admin/auth";
import { EXTENSION_BY_TYPE, IMAGE_TYPES, MAX_IMAGE_BYTES, type ImageContentType } from "@/services/admin/schemas";
import { canUseDevUploads, isValidDevFileName, saveDevUpload } from "@/services/admin/storage";

/**
 * SOLO DESARROLLO (sin AWS y NODE_ENV !== "production"): imita el PUT prefirmado de S3
 * guardando en public/uploads-dev/. Es Route Handler y no Server Action porque las
 * Server Actions limitan el body a 1 MB por defecto y las fotos pesan hasta 5 MB.
 */
export async function PUT(request: Request, ctx: RouteContext<"/admin/uploads-dev/[file]">) {
  if (!canUseDevUploads()) return new Response("Not found", { status: 404 });
  if (!(await getAdminSession())) return new Response("No autorizado", { status: 401 });

  const { file } = await ctx.params;
  if (!isValidDevFileName(file)) return new Response("Nombre inválido", { status: 400 });

  const type = request.headers.get("content-type") as ImageContentType | null;
  if (!type || !IMAGE_TYPES.includes(type) || !file.endsWith(`.${EXTENSION_BY_TYPE[type]}`)) {
    return new Response("Tipo de archivo no permitido", { status: 415 });
  }

  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_IMAGE_BYTES) {
    return new Response("Tamaño no permitido", { status: 413 });
  }

  await saveDevUpload(file, bytes);
  return new Response(null, { status: 200 });
}
