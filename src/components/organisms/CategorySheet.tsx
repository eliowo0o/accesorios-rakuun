"use client";

import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { chipClass } from "@/components/atoms/Chip";
import { Sheet } from "@/components/molecules/Sheet";
import { useCategorySheet } from "@/hooks/useCategorySheet";
import { cn } from "@/lib/cn";

/**
 * Botón "Categorías" + panel inferior. Solo la parte interactiva vive en el cliente:
 * el contenido (CategoryGrid, Server Component) llega como `children`.
 * Cualquier clic en un link del contenido cierra el panel.
 */
export function CategorySheet({ children }: { children: ReactNode }) {
  const { isOpen, open, close, onLinkClick } = useCategorySheet();

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={cn(chipClass(false), "min-h-11")}
      >
        <Menu aria-hidden className="size-4" />
        Categorías
      </button>

      <Sheet open={isOpen} onClose={close}>
        <Sheet.Header>
          <Sheet.Title>Categorías</Sheet.Title>
          <Sheet.Close label="Cerrar categorías" />
        </Sheet.Header>
        <Sheet.Body className="pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div onClick={onLinkClick}>{children}</div>
        </Sheet.Body>
      </Sheet>
    </>
  );
}
