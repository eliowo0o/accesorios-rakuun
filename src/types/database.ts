/**
 * Tipos de la base de datos (Supabase / Postgres), escritos a mano según
 * supabase/migrations/*.sql. Formato compatible con los genéricos de supabase-js
 * (`createClient<Database>()`). Si cambias el SQL, actualiza esto.
 *
 * Se usan `type` (no `interface`) porque supabase-js exige Record<string, unknown>.
 *
 * Nota: `numeric(10,2)` llega como number en JSON; `timestamptz` como string ISO.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

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
  /** Columna generada: lower(unaccent(name + ' ' + description)). Solo lectura. */
  search_text: string;
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

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13";
  };
  public: {
    Tables: {
      categories: {
        Row: CategoryRow;
        Insert: {
          id?: string;
          parent_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<CategoryRow>;
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: ProductRow;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price: number;
          is_visible?: boolean;
          is_sold_out?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          search_text?: never;
        };
        Update: Partial<Omit<ProductRow, "search_text">> & { search_text?: never };
        Relationships: [];
      };
      product_images: {
        Row: ProductImageRow;
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt?: string;
          sort_order?: number;
        };
        Update: Partial<ProductImageRow>;
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_categories: {
        Row: ProductCategoryRow;
        Insert: ProductCategoryRow;
        Update: Partial<ProductCategoryRow>;
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_categories_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      store_settings: {
        Row: StoreSettingsRow;
        Insert: {
          id?: number;
          store_name?: string;
          tagline?: string;
          hero_image_url?: string | null;
          logo_url?: string | null;
          whatsapp_number?: string;
          instagram_url?: string | null;
          location?: string | null;
          payment_methods?: string[];
          delivery_options?: string[];
          updated_at?: string;
        };
        Update: Partial<StoreSettingsRow>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      immutable_unaccent: {
        Args: { input: string };
        Returns: string;
      };
      /** Migración 0004: reemplaza product_images y product_categories en una transacción. */
      save_product_relations: {
        Args: {
          p_product_id: string;
          /** [{ url, alt }] en el orden final. */
          p_images: Json;
          p_category_ids: string[];
        };
        Returns: undefined;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicTables = Database["public"]["Tables"];
export type Tables<T extends keyof PublicTables> = PublicTables[T]["Row"];
export type TablesInsert<T extends keyof PublicTables> = PublicTables[T]["Insert"];
export type TablesUpdate<T extends keyof PublicTables> = PublicTables[T]["Update"];
