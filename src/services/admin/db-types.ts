/**
 * Tipos mínimos de las tablas que escribe el admin (snake_case, ver Obsidian "RAKUUN - Modelo de datos").
 * TEMPORAL: el agente Datos genera `src/types/database.ts`; en la integración se reemplaza por ese.
 */

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type CategoryRow = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  is_visible: boolean;
  is_sold_out: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductImageRow = {
  id: string;
  product_id: string;
  url: string;
  alt: string;
  sort_order: number;
};

export type ProductCategoryRow = {
  product_id: string;
  category_id: string;
};

export type StoreSettingsRow = {
  id: number;
  store_name: string;
  tagline: string;
  hero_image_url: string | null;
  logo_url: string | null;
  whatsapp_number: string;
  instagram_url: string | null;
  location: string | null;
  payment_methods: string[];
  delivery_options: string[];
  updated_at: string;
};

type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface AdminDatabase {
  public: {
    Tables: {
      categories: Table<CategoryRow, WithOptional<CategoryRow, "id" | "created_at" | "updated_at" | "sort_order" | "is_visible" | "description" | "image_url" | "parent_id">>;
      products: Table<ProductRow, WithOptional<ProductRow, "id" | "created_at" | "updated_at" | "sort_order" | "is_visible" | "is_sold_out" | "is_featured" | "description">>;
      product_images: Table<ProductImageRow, WithOptional<ProductImageRow, "id" | "sort_order">>;
      product_categories: Table<ProductCategoryRow, ProductCategoryRow>;
      store_settings: Table<StoreSettingsRow, WithOptional<StoreSettingsRow, "updated_at">>;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
