"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const UNSAVED_CHANGES_MESSAGE = "Tienes cambios sin guardar. ¿Salir de todos modos?";

/** ¿Este click en un <a> navega a otra página de este sitio en la misma pestaña? */
function isInternalNavigation(event: MouseEvent): HTMLAnchorElement | null {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const anchor = (event.target as Element | null)?.closest?.("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (url.pathname === window.location.pathname && url.search === window.location.search) return null;
  return anchor;
}

/**
 * Avisa antes de perder cambios sin guardar: al cerrar/recargar la pestaña (`beforeunload`)
 * y al tocar un link interno (barra del AdminShell, "volver", etc.) con confirmación nativa.
 */
export function useUnsavedChangesGuard(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Navegadores antiguos requieren returnValue.
      event.returnValue = "";
    };

    // Captura en document: corre antes que el onClick de <Link>, que respeta defaultPrevented.
    const onClick = (event: MouseEvent) => {
      if (!isInternalNavigation(event)) return;
      if (!window.confirm(UNSAVED_CHANGES_MESSAGE)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [isDirty]);
}

/**
 * ¿El formulario cambió desde la última vez que se guardó?
 * - `onChange` va en el <form>: cualquier campo nativo editado lo marca.
 * - `snapshot` cubre lo que no es campo nativo (imágenes, listas): si difiere del guardado, está sucio.
 * - `markSaved` se llama al guardar con éxito.
 */
export function useDirtyTracker(snapshot: string) {
  const [touched, setTouched] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(snapshot);
  const latest = useRef(snapshot);
  useEffect(() => {
    latest.current = snapshot;
  }, [snapshot]);

  const onChange = useCallback(() => setTouched(true), []);
  const markSaved = useCallback(() => {
    setTouched(false);
    setSavedSnapshot(latest.current);
  }, []);

  return { isDirty: touched || snapshot !== savedSnapshot, onChange, markSaved };
}
