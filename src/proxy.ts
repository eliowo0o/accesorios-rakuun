import { NextResponse, type NextRequest } from "next/server";
import { redirectKeepingCookies, updateSession } from "@/lib/supabase/proxy";
import { ADMIN_ROUTES, DEV_ADMIN_COOKIE, getAdminMode, getSupabaseEnv } from "@/services/admin/config";

/**
 * Protege /admin/** (excepto /admin/login). Chequeo optimista: la verificación real
 * (supabase.auth.getUser) se repite en requireAdmin() dentro de cada lectura y Server Action.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === ADMIN_ROUTES.login;
  const mode = getAdminMode();

  let response = NextResponse.next({ request });
  let signedIn = false;

  if (mode === "supabase") {
    const result = await updateSession(request, getSupabaseEnv()!);
    response = result.response;
    signedIn = !!result.user;
  } else if (mode === "dev") {
    signedIn = request.cookies.get(DEV_ADMIN_COOKIE)?.value === "1";
  }

  if (!signedIn && !isLogin) {
    return redirectKeepingCookies(response, new URL(ADMIN_ROUTES.login, request.url));
  }
  if (signedIn && isLogin) {
    return redirectKeepingCookies(response, new URL(ADMIN_ROUTES.home, request.url));
  }
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
