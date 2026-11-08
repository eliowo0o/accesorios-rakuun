"use client";

import { useCallback, useEffect, useRef, type MouseEvent } from "react";

/**
 * Lógica de un <dialog> modal tipo bottom sheet: sincroniza `open` con showModal/close,
 * cierra con Escape (nativo) y al hacer clic en el fondo.
 */
export function useSheet(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const onBackdropClick = useCallback(
    (e: MouseEvent<HTMLDialogElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  /** Evento nativo "close" (Escape o dialog.close()): mantener el estado en sync. */
  const onDialogClose = useCallback(() => {
    if (open) onClose();
  }, [open, onClose]);

  return { ref, onBackdropClick, onDialogClose };
}
