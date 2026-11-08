"use client";

import { useCallback, useState, type MouseEvent } from "react";

/**
 * Estado del panel inferior de categorías. Se cierra solo al elegir un link
 * (la navegación de cliente no desmonta el layout, así que hay que cerrarlo a mano).
 */
export function useCategorySheet() {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  /** Delegación: cualquier clic sobre un <a> dentro del panel lo cierra. */
  const onLinkClick = useCallback((e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest("a")) setIsOpen(false);
  }, []);

  return { isOpen, open, close, onLinkClick };
}
