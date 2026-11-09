"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ROUTES, DEV_ADMIN_COOKIE, getAdminMode } from "../config";
import { parseLoginForm, toFieldErrors } from "../schemas";
import type { ActionResult, ActionState } from "../types";

/** Login con Supabase Auth (email + contraseña). Sin registro ni "olvidé contraseña". */
export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionResult> {
  const mode = getAdminMode();
  if (mode === "unconfigured") {
    // Detalle técnico solo en logs del servidor; al usuario, mensaje genérico.
    console.error("[admin] Supabase no configurado: faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return { ok: false, error: "El panel no está disponible en este momento. Intenta más tarde." };
  }

  const parsed = parseLoginForm(formData);
  if (!parsed.success) return { ok: false, error: "Revisa los campos marcados.", fieldErrors: toFieldErrors(parsed.error) };

  if (mode === "supabase") {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return { ok: false, error: "Correo o contraseña incorrectos." };
  } else {
    // Modo desarrollo (sin Supabase, nunca en producción): cualquier credencial entra.
    const store = await cookies();
    store.set(DEV_ADMIN_COOKIE, "1", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  }
  redirect(ADMIN_ROUTES.home);
}

export async function signOut(): Promise<void> {
  const mode = getAdminMode();
  if (mode === "supabase") {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } else {
    (await cookies()).delete(DEV_ADMIN_COOKIE);
  }
  redirect(ADMIN_ROUTES.login);
}
