import type { FormEvent, ReactNode } from "react";
import { Bike, Package, Store, Truck, type LucideIcon } from "lucide-react";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import type { CheckoutFieldIds } from "@/hooks/useCheckoutForm";
import type { CheckoutErrors } from "@/lib/checkout-schema";
import { NAME_MAX, NOTE_MAX } from "@/lib/checkout-schema";
import type { CheckoutField } from "@/reducers/checkoutFormReducer";
import { cn } from "@/lib/cn";
import type { CheckoutForm as CheckoutValues } from "@/types";

export interface CheckoutFormProps {
  values: CheckoutValues;
  errors: CheckoutErrors;
  ids: CheckoutFieldIds;
  deliveryOptions: string[];
  paymentMethods: string[];
  onChange: (field: CheckoutField, value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

const deliveryIcons: [RegExp, LucideIcon][] = [
  [/recoj|recog|pick ?up|tienda/i, Store],
  [/delivery|domicilio|moto/i, Bike],
  [/env[ií]o|nacional|paqueter/i, Package],
];

function deliveryIcon(option: string): LucideIcon {
  return deliveryIcons.find(([re]) => re.test(option))?.[1] ?? Truck;
}

function errorId(ids: CheckoutFieldIds, field: CheckoutField) {
  return `${ids[field]}-error`;
}

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1 text-sm text-danger">
      {children}
    </p>
  );
}

function Field({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

/** Datos del pedido. Sin lógica: valores, errores y handlers vienen de useCheckout. */
export function CheckoutForm({ values, errors, ids, deliveryOptions, paymentMethods, onChange, onSubmit }: CheckoutFormProps) {
  const describedBy = (field: CheckoutField) => (errors[field] ? errorId(ids, field) : undefined);

  return (
    <form id={ids.form} noValidate onSubmit={onSubmit} className="space-y-4">
      <Field>
        <Label htmlFor={ids.name}>Tu nombre</Label>
        <Input
          id={ids.name}
          name="name"
          autoComplete="name"
          placeholder="Ana López"
          maxLength={NAME_MAX}
          required
          aria-required
          value={values.name}
          invalid={!!errors.name}
          aria-describedby={describedBy("name")}
          onChange={(e) => onChange("name", e.target.value)}
        />
        <FieldError id={errorId(ids, "name")}>{errors.name}</FieldError>
      </Field>

      <Field>
        <Label htmlFor={ids.phone}>Tu número de celular</Label>
        <Input
          id={ids.phone}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="55 1234 5678"
          required
          aria-required
          value={values.phone}
          invalid={!!errors.phone}
          aria-describedby={describedBy("phone")}
          onChange={(e) => onChange("phone", e.target.value)}
        />
        <FieldError id={errorId(ids, "phone")}>{errors.phone}</FieldError>
      </Field>

      {deliveryOptions.length > 0 && (
        <fieldset role="radiogroup" aria-invalid={errors.delivery ? true : undefined} aria-describedby={describedBy("delivery")}>
          <legend className="mb-1.5 block text-sm font-medium text-ink">¿Cómo lo recibes?</legend>
          <div className="grid grid-cols-3 gap-2">
            {deliveryOptions.map((option, index) => {
              const Icon = deliveryIcon(option);
              const checked = values.delivery === option;
              return (
                <label
                  key={option}
                  className={cn(
                    "flex min-h-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border bg-white px-2 py-2 text-center font-display text-sm font-semibold transition-colors",
                    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
                    checked ? "border-2 border-primary bg-primary-soft text-primary" : "border-line text-ink hover:bg-gray-50",
                    errors.delivery && !checked && "border-danger",
                  )}
                >
                  <input
                    type="radio"
                    name="delivery"
                    id={index === 0 ? ids.delivery : undefined}
                    value={option}
                    checked={checked}
                    onChange={() => onChange("delivery", option)}
                    className="sr-only"
                  />
                  <Icon className="size-5" aria-hidden />
                  <span className="leading-tight">{option}</span>
                </label>
              );
            })}
          </div>
          <FieldError id={errorId(ids, "delivery")}>{errors.delivery}</FieldError>
        </fieldset>
      )}

      {paymentMethods.length > 0 && (
        <Field>
          <Label htmlFor={ids.payment}>¿Cómo vas a pagar?</Label>
          <Select
            id={ids.payment}
            name="payment"
            value={values.payment}
            invalid={!!errors.payment}
            aria-describedby={describedBy("payment")}
            onChange={(e) => onChange("payment", e.target.value)}
          >
            <option value="" disabled>
              Elige una opción
            </option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </Select>
          <FieldError id={errorId(ids, "payment")}>{errors.payment}</FieldError>
        </Field>
      )}

      <Field>
        <Label htmlFor={ids.note}>
          Nota <span className="font-normal text-gray-500">(opcional)</span>
        </Label>
        <Textarea
          id={ids.note}
          name="note"
          rows={2}
          maxLength={NOTE_MAX}
          placeholder="Color, talla, para regalo…"
          value={values.note}
          invalid={!!errors.note}
          aria-describedby={describedBy("note")}
          onChange={(e) => onChange("note", e.target.value)}
        />
        <FieldError id={errorId(ids, "note")}>{errors.note}</FieldError>
      </Field>
    </form>
  );
}
