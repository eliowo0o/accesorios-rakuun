import { createBrowserClient } from "@supabase/ssr";
import type { AdminDatabase } from "@/services/admin/db-types";

/**
 * Cliente Supabase para el navegador (anon key pública, protegida por RLS).
 * El admin hace login y escrituras vía Server Actions; esto queda para casos puntuales en cliente.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Falta configurar Supabase (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).");
  return createBrowserClient<AdminDatabase>(url, anonKey);
}
