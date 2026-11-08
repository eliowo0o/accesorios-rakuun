import type { Metadata } from "next";
import type { Product, StoreSettings } from "@/types";
import { absoluteUrl, routes } from "@/lib/site";

/**
 * Helpers de SEO de la tienda pública: metadata (title, description, canonical, Open Graph)
 * y datos estructurados JSON-LD. Funciones puras (sin I/O) para poder probarlas.
 * Ver Obsidian: RAKUUN - SEO y renderizado.
 */

export interface BreadcrumbItem {
  name: string;
  /** Ruta relativa (p. ej. "/categoria/collares"). */
  href: string;
}

const DESCRIPTION_MAX = 160;

/** Recorta un texto para meta description sin cortar palabras a la mitad. */
export function truncate(text: string, max = DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:]+$/, "")}…`;
}

/** Convierte una URL relativa (/mock/x.jpg) en absoluta; deja intactas las absolutas (S3). */
export function toAbsoluteUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : absoluteUrl(url);
}

interface PageMetadataInput {
  /** Título de la página; el template del layout raíz agrega " · RAKUUN". */
  title?: string;
  /** Título completo sin template (home). */
  absoluteTitle?: string;
  description: string;
  path: string;
  image?: { url: string; alt: string } | null;
  noindex?: boolean;
  siteName?: string;
}

export function buildMetadata({ title, absoluteTitle, description, path, image, noindex, siteName = "RAKUUN" }: PageMetadataInput): Metadata {
  const desc = truncate(description);
  const ogTitle = absoluteTitle ?? (title ? `${title} · ${siteName}` : siteName);
  const images = image ? [{ url: toAbsoluteUrl(image.url), alt: image.alt }] : undefined;
  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description: desc,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      locale: "es_MX",
      siteName,
      url: path,
      title: ogTitle,
      description: desc,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: ogTitle,
      description: desc,
      images: images?.map((i) => i.url),
    },
  };
}

/** Descripción por defecto de un producto cuando no tiene descripción propia. */
export function productDescription(product: Product, settings: Pick<StoreSettings, "storeName" | "tagline">): string {
  return product.description?.trim() || `${product.name}, accesorio hecho a mano por ${settings.storeName}. ${settings.tagline}.`;
}

// ---------------------------------------------------------------------------
// JSON-LD
// ---------------------------------------------------------------------------

type JsonLd = Record<string, unknown>;

/** Serializa JSON-LD para <script type="application/ld+json"> escapando "<" (evita XSS). */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function productJsonLd(product: Product, settings: Pick<StoreSettings, "storeName">): JsonLd {
  const url = absoluteUrl(routes.product(product.slug));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images.map((img) => toAbsoluteUrl(img.url)),
    url,
    sku: product.id,
    category: product.categories[0]?.name,
    brand: { "@type": "Brand", name: settings.storeName },
    offers: {
      "@type": "Offer",
      url,
      price: product.price.toFixed(2),
      priceCurrency: "MXN",
      availability: product.isSoldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: settings.storeName },
    },
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}

/** Organization/Store + WebSite (con buscador) para la home. */
export function storeJsonLd(settings: StoreSettings): JsonLd[] {
  const home = absoluteUrl(routes.home());
  const store: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${home}#store`,
    name: settings.storeName,
    description: settings.tagline,
    url: home,
    logo: settings.logoUrl ? toAbsoluteUrl(settings.logoUrl) : undefined,
    image: settings.heroImageUrl ? toAbsoluteUrl(settings.heroImageUrl) : undefined,
    currenciesAccepted: "MXN",
    paymentAccepted: settings.paymentMethods.length ? settings.paymentMethods.join(", ") : undefined,
    address: settings.location ? { "@type": "PostalAddress", addressLocality: settings.location, addressCountry: "MX" } : undefined,
    sameAs: settings.instagramUrl ? [settings.instagramUrl] : undefined,
  };
  const website: JsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.storeName,
    url: home,
    inLanguage: "es-MX",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl(routes.search())}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
  return [store, website];
}
