"use client";

import Image from "next/image";
import { EyeOff, FolderPlus, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge, Button, IconButton } from "@/components/atoms";
import { ErrorNote } from "@/components/molecules/admin/FormMessage";
import { useCategoryTree, type CategoryTreeController } from "@/hooks/admin/useCategoryTree";
import type { AdminCategory, AdminCategoryNode } from "@/services/admin/types";
import { CategoryForm } from "./CategoryForm";

/** Árbol categoría → subcategorías con crear/editar/borrar inline. */
export function CategoryTree({ tree }: { tree: AdminCategoryNode[] }) {
  const ctl = useCategoryTree();
  const roots: AdminCategory[] = tree;

  return (
    <div className="flex flex-col gap-4">
      {ctl.isCreatingUnder(null) ? (
        <CategoryForm category={null} defaultParentId={null} roots={roots} hasChildren={false} onDone={ctl.close} />
      ) : (
        <Button onClick={() => ctl.openCreate(null)} className="self-start">
          <Plus aria-hidden className="size-4" />
          Nueva categoría
        </Button>
      )}

      {tree.length === 0 && <p className="text-sm text-muted">Aún no hay categorías.</p>}

      <ul className="flex flex-col gap-3">
        {tree.map((root) => (
          <li key={root.id} className="rounded-[var(--radius-card)] border border-line bg-white p-3">
            <CategoryRow category={root} subCount={root.children.length} ctl={ctl} roots={roots} />

            {(root.children.length > 0 || ctl.isCreatingUnder(root.id)) && (
              <ul className="mt-2 flex flex-col gap-2 border-l-2 border-primary-soft pl-3">
                {root.children.map((child) => (
                  <li key={child.id}>
                    <CategoryRow category={child} subCount={0} ctl={ctl} roots={roots} />
                  </li>
                ))}
                {ctl.isCreatingUnder(root.id) && (
                  <li>
                    <CategoryForm category={null} defaultParentId={root.id} roots={roots} hasChildren={false} onDone={ctl.close} />
                  </li>
                )}
              </ul>
            )}

            {!ctl.isCreatingUnder(root.id) && (
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => ctl.openCreate(root.id)}>
                <FolderPlus aria-hidden className="size-4" />
                Agregar subcategoría
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryRow({
  category,
  subCount,
  ctl,
  roots,
}: {
  category: AdminCategory;
  subCount: number;
  ctl: CategoryTreeController;
  roots: AdminCategory[];
}) {
  if (ctl.isEditing(category.id)) {
    return <CategoryForm category={category} defaultParentId={category.parentId} roots={roots} hasChildren={subCount > 0} onDone={ctl.close} />;
  }
  const deleting = ctl.deletingId === category.id;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-gray-100">
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
            /{category.slug} · orden {category.sortOrder} · {category.productCount} {category.productCount === 1 ? "producto" : "productos"}
            {subCount > 0 && ` · ${subCount} ${subCount === 1 ? "subcategoría" : "subcategorías"}`}
          </p>
        </div>
        <IconButton label={`Editar ${category.name}`} onClick={() => ctl.openEdit(category.id)}>
          <Pencil aria-hidden className="size-4" />
        </IconButton>
        <IconButton label={`Borrar ${category.name}`} onClick={() => ctl.onDelete(category)} disabled={deleting} className="text-danger">
          <Trash2 aria-hidden className="size-4" />
        </IconButton>
      </div>
      <ErrorNote>{ctl.errorFor(category.id)}</ErrorNote>
    </div>
  );
}
