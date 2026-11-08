import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { AdminDatabase } from "@/services/admin/db-types";

/**
 * Cliente Supabase CON cookies (sesión del admin). Solo para el admin: lee cookies(),
 * así que no se puede usar dentro de "use cache" y el componente que lo use va en <Suspense>.
 * El catálogo público usa un cliente sin cookies (agente Datos).
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Falta configurar Supabase (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).");

  const cookieStore = await cookies();
  return createServerClient<AdminDatabase>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Llamado desde un Server Component (no puede escribir cookies): el proxy refresca la sesión.
        }
      },
    },
  });
}

export type AdminSupabaseClient = Awaited<ReturnType<typeof createClient>>;
