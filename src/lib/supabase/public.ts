import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Cliente Supabase SIN cookies, con la anon key. Para lecturas públicas del
 * catálogo dentro de "use cache" (ahí no se puede leer cookies()).
 * Siempre actúa como rol `anon`, así que RLS solo le deja ver lo visible.
 * El admin NO usa este cliente (usa el de @supabase/ssr con cookies).
 */

export type PublicSupabaseClient = SupabaseClient<Database>;

/** true si existen NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY. */
export function hasSupabaseEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

let client: PublicSupabaseClient | null = null;

export function getPublicSupabase(): PublicSupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  client = createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}
