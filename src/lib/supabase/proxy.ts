import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca la sesión de Supabase en el proxy (copia las cookies renovadas a la respuesta)
 * y dice si hay usuario. Es un chequeo optimista: cada Server Action/lectura vuelve a verificar.
 */
export async function updateSession(request: NextRequest, env: { url: string; anonKey: string }) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // No meter código entre createServerClient y getUser (recomendación de @supabase/ssr).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}

/** Redirección que conserva las cookies que el refresco de sesión haya escrito. */
export function redirectKeepingCookies(from: NextResponse, url: URL) {
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
