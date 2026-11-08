"use client";

import { createContext, use, type ReactNode } from "react";
import { useCategoryTree, type CategoryTreeContextValue } from "@/hooks/admin/useCategoryTree";
import type { AdminCategory } from "@/services/admin/types";

const CategoryTreeContext = createContext<CategoryTreeContextValue | null>(null);

/** Único lugar que sabe cómo se maneja el estado del árbol; las filas lo leen con useCategoryTreeContext. */
export function CategoryTreeProvider({ roots, children }: { roots: AdminCategory[]; children: ReactNode }) {
  const value = useCategoryTree(roots);
  return <CategoryTreeContext value={value}>{children}</CategoryTreeContext>;
}

export function useCategoryTreeContext(): CategoryTreeContextValue {
  const value = use(CategoryTreeContext);
  if (!value) throw new Error("useCategoryTreeContext debe usarse dentro de <CategoryTreeProvider>.");
  return value;
}
