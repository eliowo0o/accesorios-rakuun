"use client";

import Image from "next/image";
import { EyeOff, FolderPlus, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { ErrorNote } from "@/components/molecules/admin/FormMessage";
import { pluralize } from "@/lib/format";
import type { AdminCategory, AdminCategoryNode } from "@/services/admin/types";
import { CategoryForm } from "./CategoryForm";
import { CategoryTreeProvider, useCategoryTreeContext } from "./CategoryTreeProvider";

/** Árbol categoría → subcategorías con crear/editar/borrar inline. */
export function CategoryTree({ tree }: { tree: AdminCategoryNode[] }) {
  return (
    <CategoryTreeProvider roots={tree}>
      <div className="flex flex-col gap-4">
        <CreateSlot parentId={null} />
        {tree.length === 0 && <p className="text-sm text-muted">Aún no hay categorías.</p>}
        <ul className="flex flex-col gap-3">
          {tree.map((root) => (
            <RootItem key={root.id} root={root} />
          ))}
        </ul>
      </div>
    </CategoryTreeProvider>
  );
}

/** Botón "Nueva categoría" o, si está abierto, el formulario de alta raíz. */
function CreateSlot({ parentId }: { parentId: null }) {
  const { state, actions, meta } = useCategoryTreeContext();
  if (state.isCreatingUnder(parentId)) {
    return <CategoryForm category={null} defaultParentId={parentId} roots={meta.roots} hasChildren={false} onDone={actions.close} />;
  }
  return (
    <Button onClick={() => actions.openCreate(parentId)} className="self-start">
      <Plus aria-hidden className="size-4" />
      Nueva categoría
    </Button>
  );
}

function RootItem({ root }: { root: AdminCategoryNode }) {
  const { state, actions, meta } = useCategoryTreeContext();
  const creatingChild = state.isCreatingUnder(root.id);
  return (
    <li className="rounded-[var(--radius-card)] border border-line bg-white p-3">
      <CategoryRow category={root} subCount={root.children.length} />

      {(root.children.length > 0 || creatingChild) && (
        <ul className="mt-2 flex flex-col gap-2 border-l-2 border-primary-soft pl-3">
          {root.children.map((child) => (
            <li key={child.id}>
              <CategoryRow category={child} subCount={0} />
            </li>
          ))}
          {creatingChild && (
            <li>
              <CategoryForm category={null} defaultParentId={root.id} roots={meta.roots} hasChildren={false} onDone={actions.close} />
            </li>
          )}
        </ul>
      )}

      {!creatingChild && (
        <Button variant="ghost" className="mt-2" onClick={() => actions.openCreate(root.id)}>
          <FolderPlus aria-hidden className="size-4" />
          Agregar subcategoría
        </Button>
      )}
    </li>
  );
}

function CategoryRow({ category, subCount }: { category: AdminCategory; subCount: number }) {
  const { state, actions, meta } = useCategoryTreeContext();
  if (state.isEditing(category.id)) {
    return <CategoryForm category={category} defaultParentId={category.parentId} roots={meta.roots} hasChildren={subCount > 0} onDone={actions.close} />;
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <div className="relative mr-2 size-12 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          {category.imageUrl && <Image src={category.imageUrl} alt={category.name} fill sizes="48px" className="object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5 font-display text-sm font-semibold text-ink">
            {category.name}
            {!category.isVisible && (
              <Badge tone="neutral">
                <EyeOff aria-hidden className="mr-1 size-3" />
                Oculta
              </Badge>
            )}
          </p>
          <p className="truncate text-xs text-muted">
            /{category.slug} · orden {category.sortOrder} · {pluralize(category.productCount, "producto", "productos")}
            {subCount > 0 && ` · ${pluralize(subCount, "subcategoría", "subcategorías")}`}
          </p>
        </div>
        <IconButton label={`Editar ${category.name}`} onClick={() => actions.openEdit(category.id)}>
          <Pencil aria-hidden className="size-4" />
        </IconButton>
        <IconButton
          label={`Borrar ${category.name}`}
          onClick={() => actions.remove(category)}
          disabled={state.isDeleting(category.id)}
          className="text-danger"
        >
          <Trash2 aria-hidden className="size-4" />
        </IconButton>
      </div>
      <ErrorNote>{state.errorFor(category.id)}</ErrorNote>
    </div>
  );
}
