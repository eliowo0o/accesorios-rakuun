import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ROUTES, DEV_ADMIN_COOKIE, getAdminMode } from "./config";

export interface AdminSession {
  email: string;
  mode: "supabase" | "dev";
}

/**
 * Sesión del admin verificada (Data Access Layer). En Supabase usa getUser(), que valida
 * el token contra el servidor de Auth (getSession solo lee la cookie y no es confiable).
 * Sin tabla admins: cualquier usuario autenticado es admin (signups desactivados en Supabase).
 * Lee cookies() → quien la use debe estar dentro de <Suspense>.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  // Siempre lee la request (aunque falte configuración) para que el admin nunca se prerenderice.
  const store = await cookies();
  const mode = getAdminMode();
  if (mode === "supabase") {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    // Los usuarios anónimos de Supabase también son "authenticated": no son admin.
    if (error || !data.user || data.user.is_anonymous) return null;
    return { email: data.user.email ?? "admin", mode };
  }
  if (mode === "dev") {
    return store.get(DEV_ADMIN_COOKIE)?.value === "1" ? { email: "dev@rakuun.local", mode } : null;
  }
  return null;
});

/** Llamar al inicio de TODA lectura del admin y de TODA Server Action. Redirige a login si no hay sesión. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect(ADMIN_ROUTES.login);
  return session;
}
