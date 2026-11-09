/**
 * Datos de prueba basados en la app actual de RAKUUN.
 * Se usan mientras no existan las variables de Supabase (ver services/catalog.ts).
 */

export interface MockCategory {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isVisible: boolean;
}

export interface MockProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  isVisible: boolean;
  isSoldOut: boolean;
  isFeatured: boolean;
  sortOrder: number;
  images: { id: string; url: string; alt: string; sortOrder: number }[];
  categoryIds: string[];
  createdAt: string;
  updatedAt: string;
}

const c = (n: number) => `00000000-0000-4000-8000-0000000000${String(n).padStart(2, "0")}`;
const p = (n: number) => `10000000-0000-4000-8000-0000000000${String(n).padStart(2, "0")}`;
const i = (n: number) => `20000000-0000-4000-8000-0000000000${String(n).padStart(2, "0")}`;

export const mockCategories: MockCategory[] = [
  { id: c(1), parentId: null, name: "Collares", slug: "collares", description: "Collares hechos a mano con perlas, cristales y dijes.", imageUrl: "/mock/collar-de-estrella.jpg", sortOrder: 1, isVisible: true },
  { id: c(2), parentId: null, name: "Aretes", slug: "aretes", description: "Aretes artesanales.", imageUrl: null, sortOrder: 2, isVisible: true },
  { id: c(3), parentId: null, name: "Pulseras", slug: "pulseras", description: "Pulseras y brazaletes hechos a mano.", imageUrl: "/mock/brazalete-estrella.jpg", sortOrder: 3, isVisible: true },
  { id: c(4), parentId: null, name: "Llaveros", slug: "llaveros", description: null, imageUrl: null, sortOrder: 4, isVisible: true },
  { id: c(5), parentId: null, name: "Broches", slug: "broches", description: null, imageUrl: null, sortOrder: 5, isVisible: true },
  { id: c(6), parentId: null, name: "Phonecharms", slug: "phonecharms", description: "Colgantes para celular.", imageUrl: null, sortOrder: 6, isVisible: true },
  // Subcategorías
  { id: c(11), parentId: c(1), name: "Perlas", slug: "collares-perlas", description: "Collares con perlas y cristales.", imageUrl: null, sortOrder: 1, isVisible: true },
  { id: c(12), parentId: c(1), name: "Con dije", slug: "collares-con-dije", description: "Collares con dije colgante.", imageUrl: null, sortOrder: 2, isVisible: true },
  { id: c(31), parentId: c(3), name: "Brazaletes", slug: "pulseras-brazaletes", description: "Brazaletes con cadena y dijes.", imageUrl: null, sortOrder: 1, isVisible: true },
  { id: c(32), parentId: c(3), name: "Estrellas", slug: "pulseras-estrellas", description: "Pulseras con dijes de estrella.", imageUrl: null, sortOrder: 2, isVisible: true },
  { id: c(51), parentId: c(5), name: "Pines", slug: "broches-pines", description: null, imageUrl: null, sortOrder: 1, isVisible: true },
  { id: c(61), parentId: c(6), name: "Cuentas", slug: "phonecharms-cuentas", description: null, imageUrl: null, sortOrder: 1, isVisible: true },
];

const now = "2026-11-08T00:00:00.000Z";

export const mockProducts: MockProduct[] = [
  {
    id: p(1), name: "Collar de estrella", slug: "collar-de-estrella",
    description: "Collar de perlas, cristales tornasol y dije de estrella plateado. Hecho a mano en CDMX.",
    price: 60, isVisible: true, isSoldOut: false, isFeatured: true, sortOrder: 1,
    images: [{ id: i(1), url: "/mock/collar-de-estrella.jpg", alt: "Collar de perlas y cristales con dije de estrella", sortOrder: 1 }],
    categoryIds: [c(11), c(12)], createdAt: now, updatedAt: now,
  },
  {
    id: p(2), name: "Collar estrellas colgantes", slug: "collar-estrellas-colgantes",
    description: "Collar de cuentas negras con estrellas colgantes.",
    price: 120, isVisible: true, isSoldOut: false, isFeatured: false, sortOrder: 2,
    images: [{ id: i(2), url: "/mock/collar-estrellas-colgantes.jpg", alt: "Collar de cuentas negras con estrellas colgantes", sortOrder: 1 }],
    categoryIds: [c(12)], createdAt: now, updatedAt: now,
  },
  {
    id: p(3), name: "Brazalete nube", slug: "brazalete-nube",
    description: "Brazalete de cadena plateada con perlas, estrellas y cuentas blancas.",
    price: 60, isVisible: true, isSoldOut: false, isFeatured: true, sortOrder: 3,
    images: [{ id: i(3), url: "/mock/brazalete-nube.jpg", alt: "Brazalete de cadena con perlas y estrellas", sortOrder: 1 }],
    categoryIds: [c(31), c(32)], createdAt: now, updatedAt: now,
  },
  {
    id: p(4), name: "Brazalete estrella", slug: "brazalete-estrella",
    description: "Brazalete con cuentas negras y aqua, perlas y dijes de espiral.",
    price: 60, isVisible: true, isSoldOut: true, isFeatured: false, sortOrder: 4,
    images: [
      { id: i(4), url: "/mock/brazalete-estrella.jpg", alt: "Brazalete con cuentas negras, perlas y espirales", sortOrder: 1 },
      { id: i(5), url: "/mock/brazalete-nube.jpg", alt: "Detalle del brazalete", sortOrder: 2 },
    ],
    categoryIds: [c(31)], createdAt: now, updatedAt: now,
  },
  {
    id: p(5), name: "Broche mapache", slug: "broche-mapache",
    description: "Broche con la ilustración del mapache de RAKUUN.",
    price: 45, isVisible: true, isSoldOut: false, isFeatured: false, sortOrder: 5,
    images: [{ id: i(6), url: "/mock/logo.jpg", alt: "Broche con ilustración de mapache", sortOrder: 1 }],
    categoryIds: [c(51)], createdAt: now, updatedAt: now,
  },
  {
    id: p(6), name: "Phonecharm perlas", slug: "phonecharm-perlas",
    description: "Colgante para celular con perlas y cristales.",
    price: 50, isVisible: false, isSoldOut: false, isFeatured: false, sortOrder: 6,
    images: [],
    categoryIds: [c(61)], createdAt: now, updatedAt: now,
  },
];

export const mockSettings = {
  storeName: "RAKUUN",
  tagline: "Envíos a todo México",
  heroImageUrl: "/mock/hero.jpg",
  logoUrl: "/mock/logo.jpg",
  whatsappNumber: "525543799503",
  instagramUrl: "https://instagram.com/",
  location: "CDMX",
  paymentMethods: ["Efectivo", "Transferencia"],
  deliveryOptions: ["Recojo", "Delivery", "Envío nacional"],
};
