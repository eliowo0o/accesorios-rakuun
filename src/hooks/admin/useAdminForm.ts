"use client";

import { startTransition, useActionState, useEffect, useRef, type FormEvent } from "react";
import type { ActionResult, ActionState } from "@/services/admin/types";

type ServerAction = (prev: ActionState, formData: FormData) => Promise<ActionResult>;

/**
 * useActionState + envío manual. Se despacha en startTransition desde onSubmit para que
 * React NO resetee el formulario cuando hay errores (así no se pierde lo escrito).
 */
export function useAdminForm(action: ServerAction, options: { onSuccess?: (result: ActionResult) => void } = {}) {
  const { onSuccess } = options;
  const [state, dispatch, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await action(prev, formData);
    if (result.ok) onSuccess?.(result);
    return result;
  }, null);

  const formRef = useRef<HTMLFormElement | null>(null);

  // Si el servidor marcó campos, llevar al primero (puede estar fuera de la vista) y enfocarlo.
  useEffect(() => {
    if (!state || state.ok || !formRef.current) return;
    const first = formRef.current.querySelector<HTMLElement>('[aria-invalid="true"], [data-field-error]');
    if (!first) return;
    first.scrollIntoView({ behavior: "smooth", block: "center" });
    if (first.matches("input, select, textarea")) first.focus({ preventScroll: true });
  }, [state]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    formRef.current = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };

  const fieldError = (name: string): string | undefined =>
    state && !state.ok ? state.fieldErrors?.[name]?.[0] : undefined;

  return { state, pending, onSubmit, fieldError };
}

export type AdminFormController = ReturnType<typeof useAdminForm>;
