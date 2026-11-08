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

interface SheetCtx {
  titleId: string;
  onClose: () => void;
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
  className?: string;
}

function SheetRoot({ open, onClose, children, className }: SheetProps) {
  const { ref, onBackdropClick, onDialogClose } = useSheet(open, onClose);
  const titleId = useId();
  return (
    <SheetContext value={{ titleId, onClose }}>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        onClick={onBackdropClick}
        onClose={onDialogClose}
        className={cn(
          "m-0 mt-auto max-h-[90dvh] w-full max-w-none overflow-hidden rounded-t-[1.75rem] bg-white p-0 text-ink shadow-2xl",
          "backdrop:bg-black/40 sm:mx-auto sm:mb-auto sm:max-w-lg sm:rounded-[1.75rem]",
          "open:flex open:flex-col",
          className,
        )}
      >
        <div aria-hidden className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-gray-200 sm:hidden" />
        {children}
      </dialog>
    </SheetContext>
  );
}

function Header({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex shrink-0 items-center justify-between gap-4 px-6 pb-2 pt-4", className)}>{children}</div>;
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
  return <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-2", className)}>{children}</div>;
}

function Footer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("shrink-0 border-t border-line px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4", className)}>{children}</div>;
}

export const Sheet = Object.assign(SheetRoot, { Header, Title, Close, Body, Footer });
