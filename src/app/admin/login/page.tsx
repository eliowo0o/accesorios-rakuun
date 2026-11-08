import type { Metadata } from "next";
import { CircleAlert } from "lucide-react";
import { LoginForm } from "@/components/organisms/admin/LoginForm";
import { getAdminMode } from "@/services/admin/config";

export const metadata: Metadata = {
  title: "Entrar al admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  const mode = getAdminMode();
  return (
    <main className="flex min-h-dvh items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-sm">
        <h1 className="font-display text-2xl font-extrabold text-ink">
          RAKUUN <span className="text-primary">admin</span>
        </h1>
        {mode === "unconfigured" ? (
          <p role="alert" className="mt-4 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-danger">
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            Falta configurar Supabase. Agrega NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel y vuelve a desplegar.
          </p>
        ) : (
          <>
            <p className="mb-5 mt-1 text-sm text-muted">Entra con tu correo y contraseña.</p>
            {mode === "dev" && (
              <p className="mb-4 rounded-2xl bg-brand-ochre/20 px-4 py-3 text-xs text-ink">
                Modo desarrollo (sin Supabase): cualquier correo y contraseña entran.
              </p>
            )}
            <LoginForm />
          </>
        )}
      </div>
    </main>
  );
}
