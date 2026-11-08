"use client";

import { LogIn } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/admin/FormField";
import { FormMessage } from "@/components/molecules/admin/FormMessage";
import { useLoginForm } from "@/hooks/admin/useLoginForm";

export function LoginForm() {
  const { state, pending, onSubmit, fieldError } = useLoginForm();
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <FormField id="email" label="Correo" error={fieldError("email")}>
        {(field) => (
          <Input {...field} name="email" type="email" autoComplete="username" inputMode="email" required invalid={!!fieldError("email")} />
        )}
      </FormField>
      <FormField id="password" label="Contraseña" error={fieldError("password")}>
        {(field) => <Input {...field} name="password" type="password" autoComplete="current-password" required invalid={!!fieldError("password")} />}
      </FormField>
      {state && !state.ok && !state.fieldErrors && <FormMessage state={state} />}
      <Button type="submit" size="lg" fullWidth disabled={pending}>
        <LogIn aria-hidden className="size-5" />
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
