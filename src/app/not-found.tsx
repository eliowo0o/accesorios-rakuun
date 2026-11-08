import type { Metadata } from "next";
import { NotFoundContent } from "@/components/organisms/NotFoundContent";

/** 404 global (URLs que no coinciden con ninguna ruta; vive fuera del layout de la tienda). */
export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <main className="flex flex-1 items-center justify-center">
      <NotFoundContent />
    </main>
  );
}
