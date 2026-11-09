import { z } from "zod";
import type { FieldErrors } from "./types";
import { getS3PublicBaseUrl, isProduction } from "./config";

/**
 * Esquemas zod del admin. Puros (sin server-only): los usan las Server Actions y se pueden
 * reusar en cliente. Los `parseXForm` convierten FormData → objeto validado.
 */

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type ImageContentType = (typeof IMAGE_TYPES)[number];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const UPLOAD_FOLDERS = ["products", "categories", "settings"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];
export const MAX_PRODUCT_IMAGES = 12;

const text = (v: unknown) => (typeof v === "string" ? v : "");

/** Texto opcional: "" → null. */
const optionalText = (max: number) =>
  z.preprocess(text, z.string().trim().max(max, `Máximo ${max} caracteres`)).transform((v) => v || null);

/** Checkbox de formulario: "on"/"true" → true, ausente → false. */
const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

const intField = (label: string) =>
  z.preprocess(
    (v) => (text(v).trim() === "" ? 0 : Number(text(v))),
    z.number({ error: `${label} debe ser un número` }).int(`${label} debe ser un número entero`).min(0, `${label} no puede ser negativo`).max(9999),
  );

/**
 * URL de imagen guardable. En producción SOLO URLs del bucket S3 propio (la BD guarda solo URLs de S3);
 * en desarrollo también rutas locales ("/mock/…", "/uploads-dev/…"). Nunca javascript:, data: ni "//host".
 */
export function isAllowedImageUrl(v: string): boolean {
  if (/\s/.test(v)) return false;
  const s3 = getS3PublicBaseUrl();
  if (s3 && v.startsWith(`${s3}/`)) return true;
  // Imágenes de prueba incluidas en el propio sitio (public/mock): mismo origen, seguras. Las usa seed.sql.
  if (/^\/mock\/[\w.-]+$/.test(v)) return true;
  // Rutas locales (datos de prueba y subidas en modo dev) solo fuera de producción.
  if (!isProduction()) {
    return (v.startsWith("/") && !v.startsWith("//")) || (!s3 && /^https:\/\/[^\s]+$/.test(v));
  }
  return false;
}

export const imageUrlSchema = z.string().trim().max(1000).refine(isAllowedImageUrl, "URL de imagen inválida");

const optionalImageUrl = z.preprocess((v) => text(v).trim() || null, imageUrlSchema.nullable());

const slugField = z.preprocess(text, z.string().trim().max(100, "Máximo 100 caracteres"));

const nameField = (max: number) =>
  z.preprocess(text, z.string().trim().min(1, "Escribe el nombre").max(max, `Máximo ${max} caracteres`));

export const idSchema = z.uuid("Id inválido");

// ---------- Categorías ----------

export const categoryFormSchema = z.object({
  name: nameField(80),
  slug: slugField,
  description: optionalText(500),
  imageUrl: optionalImageUrl,
  parentId: z.preprocess((v) => text(v) || null, idSchema.nullable()),
  sortOrder: intField("El orden"),
  isVisible: checkbox,
});
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// ---------- Productos ----------

const productImagesField = z.preprocess(
  (v) => {
    try {
      return JSON.parse(text(v) || "[]");
    } catch {
      return null;
    }
  },
  z
    .array(z.object({ url: imageUrlSchema, alt: z.string().trim().max(200, "El texto alternativo es muy largo") }), {
      error: "Imágenes inválidas",
    })
    .max(MAX_PRODUCT_IMAGES, `Máximo ${MAX_PRODUCT_IMAGES} imágenes`),
);

const priceField = z.preprocess(
  (v) => {
    const raw = text(v).trim().replace(/\s/g, "").replace(",", ".");
    return raw === "" ? undefined : Number(raw);
  },
  z
    .number({ error: "Escribe un precio válido" })
    .refine(Number.isFinite, "Escribe un precio válido")
    .min(0, "El precio no puede ser negativo")
    .max(1_000_000, "Precio demasiado alto")
    .transform((n) => Math.round(n * 100) / 100),
);

export const productFormSchema = z.object({
  name: nameField(120),
  slug: slugField,
  description: optionalText(2000),
  price: priceField,
  categoryIds: z.array(idSchema).max(30, "Demasiadas categorías"),
  images: productImagesField,
  isVisible: checkbox,
  isSoldOut: checkbox,
  isFeatured: checkbox,
  sortOrder: intField("El orden"),
});
export type ProductFormValues = z.infer<typeof productFormSchema>;

// ---------- Ajustes ----------

const listField = (label: string) =>
  z
    .array(z.string().trim().max(40, `Cada opción de ${label} admite máximo 40 caracteres`))
    .transform((items) => [...new Set(items.filter(Boolean))])
    .pipe(z.array(z.string()).min(1, `Agrega al menos una opción de ${label}`).max(10, `Máximo 10 opciones de ${label}`));

export const settingsFormSchema = z.object({
  storeName: z.preprocess(text, z.string().trim().min(1, "Escribe el nombre de la tienda").max(60)),
  tagline: z.preprocess(text, z.string().trim().max(120, "Máximo 120 caracteres")),
  heroImageUrl: optionalImageUrl,
  logoUrl: optionalImageUrl,
  whatsappNumber: z.preprocess(
    (v) => text(v).replace(/[\s()+-]/g, ""),
    z.string().regex(/^\d{10,15}$/, "Número en formato internacional, solo dígitos (p. ej. 5215512345678)"),
  ),
  instagramUrl: z.preprocess(
    (v) => text(v).trim() || null,
    z.url({ protocol: /^https$/, error: "Pega el link completo (https://instagram.com/…)" }).nullable(),
  ),
  location: optionalText(120),
  paymentMethods: listField("pago"),
  deliveryOptions: listField("entrega"),
});
export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

// ---------- Login ----------

export const loginSchema = z.object({
  email: z.preprocess((v) => text(v).trim(), z.email("Escribe un correo válido")),
  password: z.preprocess(text, z.string().min(1, "Escribe tu contraseña").max(200)),
});

// ---------- Subidas ----------

export const uploadRequestSchema = z.object({
  contentType: z.enum(IMAGE_TYPES, { error: "Solo se permiten imágenes JPG, PNG o WebP" }),
  size: z.number().int().positive("Archivo vacío").max(MAX_IMAGE_BYTES, "La imagen pesa más de 5 MB"),
  folder: z.enum(UPLOAD_FOLDERS),
});
export type UploadRequest = z.infer<typeof uploadRequestSchema>;

export const EXTENSION_BY_TYPE: Record<ImageContentType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// ---------- FormData → objeto ----------

const field = (fd: FormData, name: string) => fd.get(name) ?? undefined;
const many = (fd: FormData, name: string) => fd.getAll(name).filter((v): v is string => typeof v === "string");

export function parseCategoryForm(fd: FormData) {
  return categoryFormSchema.safeParse({
    name: field(fd, "name"),
    slug: field(fd, "slug"),
    description: field(fd, "description"),
    imageUrl: field(fd, "imageUrl"),
    parentId: field(fd, "parentId"),
    sortOrder: field(fd, "sortOrder"),
    isVisible: field(fd, "isVisible"),
  });
}

export function parseProductForm(fd: FormData) {
  return productFormSchema.safeParse({
    name: field(fd, "name"),
    slug: field(fd, "slug"),
    description: field(fd, "description"),
    price: field(fd, "price"),
    categoryIds: many(fd, "categoryIds"),
    images: field(fd, "images"),
    isVisible: field(fd, "isVisible"),
    isSoldOut: field(fd, "isSoldOut"),
    isFeatured: field(fd, "isFeatured"),
    sortOrder: field(fd, "sortOrder"),
  });
}

export function parseSettingsForm(fd: FormData) {
  return settingsFormSchema.safeParse({
    storeName: field(fd, "storeName"),
    tagline: field(fd, "tagline"),
    heroImageUrl: field(fd, "heroImageUrl"),
    logoUrl: field(fd, "logoUrl"),
    whatsappNumber: field(fd, "whatsappNumber"),
    instagramUrl: field(fd, "instagramUrl"),
    location: field(fd, "location"),
    paymentMethods: many(fd, "paymentMethods"),
    deliveryOptions: many(fd, "deliveryOptions"),
  });
}

export function parseLoginForm(fd: FormData) {
  return loginSchema.safeParse({ email: field(fd, "email"), password: field(fd, "password") });
}

/** Errores de zod → { campo: [mensajes] } para pintar junto a cada input. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  return z.flattenError(error).fieldErrors as FieldErrors;
}
