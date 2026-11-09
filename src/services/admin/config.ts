/**
 * Detección de entorno del admin. Una sola fuente de verdad para decidir:
 * - "supabase": hay variables de Supabase → login real + escrituras a Postgres.
 * - "dev": sin Supabase y NODE_ENV !== "production" → login acepta cualquier credencial
 *   (cookie httpOnly `rakuun-dev-admin`) y las escrituras van al repositorio en memoria.
 * - "unconfigured": producción sin Supabase → no se puede entrar.
 *
 * Sin `server-only` a propósito: lo usa también `src/proxy.ts`. No lee secretos.
 */

export type AdminMode = "supabase" | "dev" | "unconfigured";

export const DEV_ADMIN_COOKIE = "rakuun-dev-admin";

export const ADMIN_ROUTES = {
  login: "/admin/login",
  home: "/admin",
  categories: "/admin/categorias",
  products: "/admin/productos",
  newProduct: "/admin/productos/nuevo",
  product: (id: string) => `/admin/productos/${id}`,
  settings: "/admin/ajustes",
  errors: "/admin/errores",
} as const;

export function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function getAdminMode(): AdminMode {
  if (getSupabaseEnv()) return "supabase";
  return isProduction() ? "unconfigured" : "dev";
}

/** Base pública del bucket sin "/" final, o null. Pública (NEXT_PUBLIC_), segura en cliente. */
export function getS3PublicBaseUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL;
  return base ? base.replace(/\/+$/, "") : null;
}
