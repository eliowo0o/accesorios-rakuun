import type { Category, Product, ProductImage, StoreSettings, UUID } from "@/types";

/** Categoría vista desde el admin: incluye ocultas; `productCount` = productos asignados directo (visibles u ocultos). */
export interface AdminCategory extends Omit<Category, "productCount"> {
  productCount: number;
}

export interface AdminCategoryNode extends AdminCategory {
  children: AdminCategory[];
}

/** Producto visto desde el admin: incluye ocultos; categorías como ids. */
export interface AdminProduct extends Omit<Product, "categories"> {
  categoryIds: UUID[];
}

export interface CategoryData {
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: UUID | null;
  sortOrder: number;
  isVisible: boolean;
}

export interface ProductImageData {
  url: string;
  alt: string;
}

export interface ProductData {
  name: string;
  slug: string;
  description: string | null;
  price: number;
  isVisible: boolean;
  isSoldOut: boolean;
  isFeatured: boolean;
  sortOrder: number;
  categoryIds: UUID[];
  /** En el orden final; el índice se vuelve sortOrder (la primera es portada). */
  images: ProductImageData[];
}

export type SettingsData = StoreSettings;

export interface AdminSummary {
  products: number;
  hidden: number;
  soldOut: number;
  featured: number;
  categories: number;
  subcategories: number;
}

export interface ProductFilters {
  q?: string;
  categoryId?: string;
  visible?: "si" | "no";
  soldOut?: "si" | "no";
  featured?: "si" | "no";
}

export type { ProductImage };

/** Resultado de toda Server Action del admin (compatible con useActionState). */
export type FieldErrors = Partial<Record<string, string[]>>;
export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: FieldErrors };
/** Estado inicial de useActionState: null = aún no se envía. */
export type ActionState = ActionResult | null;
