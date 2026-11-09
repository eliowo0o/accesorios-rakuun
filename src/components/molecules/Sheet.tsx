"use client";

import { createContext, use, useId, type ReactNode } from "react";
import { X } from "lucide-react";
import { IconButton } from "@/components/atoms/IconButton";
import { useSheet } from "@/hooks/useSheet";
import { cn } from "@/lib/cn";

/**
 * Bottom sheet compuesto (compound component) sobre <dialog> nativo.
 * Compartido por CategorySheet (Tienda) y CartSheet (Carrito). CONTRATO de Fase 0.
 *
 * <Sheet open={isOpen} onClose={close}>
 *   <Sheet.Header>
 *     <Sheet.Title>Tu pedido</Sheet.Title>
 *     <Sheet.Close />
 *   </Sheet.Header>
 *   <Sheet.Body>…</Sheet.Body>
 *   <Sheet.Footer>…</Sheet.Footer>
 * </Sheet>
 */

/** Dónde se abre en pantallas ≥ sm. En celular siempre sale desde abajo. */
export type SheetPlacement = "center" | "right";

interface SheetCtx {
  titleId: string;
  onClose: () => void;
  placement: SheetPlacement;
}
const SheetContext = createContext<SheetCtx | null>(null);
function useSheetContext() {
  const ctx = use(SheetContext);
  if (!ctx) throw new Error("Los subcomponentes de Sheet van dentro de <Sheet>");
  return ctx;
}

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** "center": modal centrado (por defecto). "right": panel lateral de alto completo (carrito). */
  placement?: SheetPlacement;
  className?: string;
}

/*
 * Layout a prueba de Safari: el <dialog> es el que hace scroll (bloque normal, sin depender de
 * flex-shrink con altura automática, que en Safari aplastaba el cuerpo a 0). Header y Footer
 * quedan fijos con `sticky`. Solo el panel derecho (altura definida) usa flex para empujar el
 * Footer al fondo cuando hay poco contenido.
 */
const PLACEMENT: Record<SheetPlacement, string> = {
  center: "sm:mx-auto sm:mb-auto sm:max-w-lg sm:rounded-[1.75rem]",
  right: "sm:my-0 sm:mr-0 sm:ml-auto sm:h-dvh sm:max-h-dvh sm:max-w-md sm:rounded-none sm:rounded-l-[1.75rem] sm:open:flex sm:open:flex-col",
};

function SheetRoot({ open, onClose, children, placement = "center", className }: SheetProps) {
  const { ref, onBackdropClick, onDialogClose } = useSheet(open, onClose);
  const titleId = useId();
  return (
    <SheetContext value={{ titleId, onClose, placement }}>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        onClick={onBackdropClick}
        onClose={onDialogClose}
        className={cn(
          "m-0 mt-auto max-h-[90dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-[1.75rem] bg-white p-0 text-ink shadow-2xl",
          "backdrop:bg-black/40",
          PLACEMENT[placement],
          className,
        )}
      >
        {children}
      </dialog>
    </SheetContext>
  );
}

function Header({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("sticky top-0 z-10 shrink-0 bg-white px-6 pb-2 pt-3 sm:pt-4", className)}>
      <div aria-hidden className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-gray-200 sm:hidden" />
      <div className="flex items-center justify-between gap-4">{children}</div>
    </div>
  );
}

function Title({ children, className }: { children: ReactNode; className?: string }) {
  const { titleId } = useSheetContext();
  return (
    <h2 id={titleId} className={cn("font-display text-xl font-bold", className)}>
      {children}
    </h2>
  );
}

function Close({ label = "Cerrar" }: { label?: string }) {
  const { onClose } = useSheetContext();
  return (
    <IconButton label={label} variant="soft" onClick={onClose}>
      <X className="size-5" aria-hidden />
    </IconButton>
  );
}

function Body({ children, className }: { children: ReactNode; className?: string }) {
  const { placement } = useSheetContext();
  return <div className={cn("px-6 py-2", placement === "right" && "sm:flex-1", className)}>{children}</div>;
}

function Footer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 shrink-0 border-t border-line bg-white px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export const Sheet = Object.assign(SheetRoot, { Header, Title, Close, Body, Footer });
