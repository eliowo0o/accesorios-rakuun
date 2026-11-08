"use client";

import { Save } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField, FormSection } from "@/components/molecules/admin/FormField";
import { FormMessage } from "@/components/molecules/admin/FormMessage";
import { SingleImageField } from "@/components/molecules/admin/SingleImageField";
import { StringListEditor } from "@/components/molecules/admin/StringListEditor";
import { useSettingsForm } from "@/hooks/admin/useSettingsForm";
import type { StringListController } from "@/hooks/admin/useListEditor";
import type { SettingsData } from "@/services/admin/types";

export function SettingsForm({ settings }: { settings: SettingsData }) {
  const { hero, logo, payments, deliveries, form, onFormChange, busy } = useSettingsForm(settings);
  const { fieldError } = form;

  return (
    <form onSubmit={form.onSubmit} onChange={onFormChange} className="flex flex-col gap-4" noValidate>
      <FormSection title="Tienda">
        <FormField id="storeName" label="Nombre" error={fieldError("storeName")}>
          {(field) => <Input {...field} name="storeName" required maxLength={60} defaultValue={settings.storeName} invalid={!!fieldError("storeName")} />}
        </FormField>
        <FormField id="tagline" label="Texto del hero" hint="Frase corta bajo el nombre, p. ej. “Envíos a todo México”." error={fieldError("tagline")}>
          {(field) => <Input {...field} name="tagline" maxLength={120} defaultValue={settings.tagline} invalid={!!fieldError("tagline")} />}
        </FormField>
        <SingleImageField
          id="heroImage"
          name="heroImageUrl"
          label="Imagen del hero"
          alt="Imagen principal de la tienda"
          url={hero.url}
          uploader={hero.uploader}
          onClear={hero.clear}
          error={fieldError("heroImageUrl")}
        />
        <SingleImageField
          id="logo"
          name="logoUrl"
          label="Logo"
          alt="Logo de la tienda"
          url={logo.url}
          uploader={logo.uploader}
          onClear={logo.clear}
          error={fieldError("logoUrl")}
        />
      </FormSection>

      <FormSection title="Contacto">
        <FormField
          id="whatsappNumber"
          label="WhatsApp"
          hint="Formato internacional sin “+”, p. ej. 5215512345678. A este número llegan los pedidos."
          error={fieldError("whatsappNumber")}
        >
          {(field) => (
            <Input
              {...field}
              name="whatsappNumber"
              inputMode="tel"
              required
              defaultValue={settings.whatsappNumber}
              invalid={!!fieldError("whatsappNumber")}
            />
          )}
        </FormField>
        <FormField id="instagramUrl" label="Instagram (opcional)" error={fieldError("instagramUrl")}>
          {(field) => (
            <Input
              {...field}
              name="instagramUrl"
              type="url"
              inputMode="url"
              placeholder="https://instagram.com/…"
              defaultValue={settings.instagramUrl ?? ""}
              invalid={!!fieldError("instagramUrl")}
            />
          )}
        </FormField>
        <FormField id="location" label="Ubicación (opcional)" error={fieldError("location")}>
          {(field) => (
            <Input {...field} name="location" maxLength={120} placeholder="CDMX" defaultValue={settings.location ?? ""} invalid={!!fieldError("location")} />
          )}
        </FormField>
      </FormSection>

      <FormSection title="Pedidos" description="Opciones que el cliente elige en el carrito.">
        <ListField id="paymentMethods" label="Métodos de pago" placeholder="p. ej. Transferencia" list={payments} error={fieldError("paymentMethods")} />
        <ListField id="deliveryOptions" label="Tipos de entrega" placeholder="p. ej. Envío nacional" list={deliveries} error={fieldError("deliveryOptions")} />
      </FormSection>

      <FormMessage state={form.state} />

      <div className="sticky bottom-0 -mx-4 border-t border-line bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <Button type="submit" size="lg" fullWidth disabled={busy} className="sm:w-auto">
          <Save aria-hidden className="size-5" />
          {form.pending ? "Guardando…" : "Guardar ajustes"}
        </Button>
      </div>
    </form>
  );
}

function ListField({ id, label, placeholder, list, error }: { id: string; label: string; placeholder: string; list: StringListController; error?: string }) {
  return (
    <StringListEditor
      id={id}
      name={id}
      label={label}
      placeholder={placeholder}
      items={list.items}
      draft={list.draft}
      onDraftChange={list.setDraft}
      onDraftKeyDown={list.onDraftKeyDown}
      onAdd={list.addDraft}
      onRemove={list.remove}
      onMoveUp={list.moveUp}
      onMoveDown={list.moveDown}
      error={error}
    />
  );
}
