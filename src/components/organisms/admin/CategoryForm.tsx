"use client";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { CheckboxField } from "@/components/molecules/admin/CheckboxField";
import { FormField } from "@/components/molecules/admin/FormField";
import { FormMessage } from "@/components/molecules/admin/FormMessage";
import { SingleImageField } from "@/components/molecules/admin/SingleImageField";
import { useCategoryForm } from "@/hooks/admin/useCategoryForm";
import type { AdminCategory } from "@/services/admin/types";

/** Crear o editar una categoría/subcategoría (inline en el árbol). */
export function CategoryForm({
  category,
  defaultParentId,
  roots,
  hasChildren,
  onDone,
}: {
  category: AdminCategory | null;
  defaultParentId: string | null;
  /** Categorías raíz posibles como padre. */
  roots: AdminCategory[];
  hasChildren: boolean;
  onDone: () => void;
}) {
  const { slugField, image, form, fid, parentOptions, onFormChange, busy } = useCategoryForm(category, { defaultParentId, roots, onDone });
  const { fieldError } = form;

  return (
    <form
      onSubmit={form.onSubmit}
      onChange={onFormChange}
      className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-primary/30 bg-white p-4"
      noValidate
    >
      {category && <input type="hidden" name="id" value={category.id} />}

      <FormField id={fid("name")} label="Nombre" error={fieldError("name")}>
        {(field) => (
          <Input
            {...field}
            name="name"
            required
            maxLength={80}
            value={slugField.name}
            onChange={(e) => slugField.onNameChange(e.target.value)}
            invalid={!!fieldError("name")}
          />
        )}
      </FormField>

      <FormField id={fid("slug")} label="Slug (URL)" hint="Se genera del nombre; puedes cambiarlo." error={fieldError("slug")}>
        {(field) => (
          <Input
            {...field}
            name="slug"
            maxLength={100}
            value={slugField.slug}
            onChange={(e) => slugField.onSlugChange(e.target.value)}
            onBlur={slugField.onSlugBlur}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            invalid={!!fieldError("slug")}
          />
        )}
      </FormField>

      <FormField
        id={fid("parentId")}
        label="Categoría padre"
        hint={hasChildren ? "Tiene subcategorías, así que se queda como categoría principal." : "Vacío = categoría principal."}
        error={fieldError("parentId")}
      >
        {(field) => (
          <>
            {hasChildren && <input type="hidden" name="parentId" value="" />}
            <Select
              {...field}
              name={hasChildren ? undefined : "parentId"}
              defaultValue={category?.parentId ?? defaultParentId ?? ""}
              disabled={hasChildren}
              invalid={!!fieldError("parentId")}
            >
              <option value="">— Ninguna (principal) —</option>
              {parentOptions.map((root) => (
                <option key={root.id} value={root.id}>
                  {root.name}
                </option>
              ))}
            </Select>
          </>
        )}
      </FormField>

      <FormField id={fid("description")} label="Descripción (opcional)" hint="Se usa en Google." error={fieldError("description")}>
        {(field) => (
          <Textarea {...field} name="description" maxLength={500} defaultValue={category?.description ?? ""} invalid={!!fieldError("description")} />
        )}
      </FormField>

      <SingleImageField
        id={fid("image")}
        name="imageUrl"
        label="Imagen (opcional)"
        alt={slugField.name || "Imagen de la categoría"}
        url={image.url}
        uploader={image.uploader}
        onClear={image.clear}
        error={fieldError("imageUrl")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={fid("sortOrder")} label="Orden" hint="Menor número = aparece primero." error={fieldError("sortOrder")}>
          {(field) => (
            <Input
              {...field}
              name="sortOrder"
              type="number"
              inputMode="numeric"
              min={0}
              max={9999}
              defaultValue={category?.sortOrder ?? 0}
              invalid={!!fieldError("sortOrder")}
            />
          )}
        </FormField>
        <CheckboxField name="isVisible" label="Visible en la tienda" defaultChecked={category?.isVisible ?? true} className="self-end" />
      </div>

      <FormMessage state={form.state && !form.state.ok ? form.state : null} />

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={onDone} disabled={form.pending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={busy}>
          {form.pending ? "Guardando…" : category ? "Guardar cambios" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
