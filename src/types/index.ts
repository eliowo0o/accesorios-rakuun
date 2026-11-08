/**
 * Tipos de dominio compartidos. CONTRATO: los agentes no los cambian sin avisar.
 * Ver Obsidian: RAKUUN - Modelo de datos.
 */

export type UUID = string;

export interface Category {
  id: UUID;
  parentId: UUID | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isVisible: boolean;
  /** Productos visibles en la categoría (incluye los de sus subcategorías). */
  productCount: number;
}

export interface CategoryWithChildren extends Category {
  children: Category[];
}

export interface ProductImage {
  id: UUID;
  url: string;
  alt: string;
  sortOrder: number;
}

export interface CategoryRef {
  id: UUID;
  name: string;
  slug: string;
  /** Slug de la categoría padre si es subcategoría; null si es categoría raíz. */
  parentSlug: string | null;
}

export interface Product {
  id: UUID;
  name: string;
  slug: string;
  description: string | null;
  /** Precio en MXN. */
  price: number;
  isVisible: boolean;
  isSoldOut: boolean;
  isFeatured: boolean;
  sortOrder: number;
  /** Ordenadas por sortOrder; la primera es la portada. */
  images: ProductImage[];
  categories: CategoryRef[];
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  heroImageUrl: string | null;
  logoUrl: string | null;
  /** Formato internacional sin "+", p. ej. 5215512345678 */
  whatsappNumber: string;
  instagramUrl: string | null;
  location: string | null;
  paymentMethods: string[];
  deliveryOptions: string[];
}

/** Lo que el carrito guarda por línea (snapshot del producto al agregarlo). */
export interface CartItem {
  productId: UUID;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

export interface CheckoutForm {
  name: string;
  phone: string;
  delivery: string;
  payment: string;
  note: string;
}
