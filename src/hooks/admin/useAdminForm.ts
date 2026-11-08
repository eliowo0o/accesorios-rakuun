"use client";

import { startTransition, useActionState, type FormEvent } from "react";
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

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };

  const fieldError = (name: string): string | undefined =>
    state && !state.ok ? state.fieldErrors?.[name]?.[0] : undefined;

  return { state, pending, onSubmit, fieldError };
}

export type AdminFormController = ReturnType<typeof useAdminForm>;
