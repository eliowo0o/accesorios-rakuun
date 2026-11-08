/** URL pública del sitio (canonical, sitemap, links en el mensaje de WhatsApp). */
// Prioridad: variable propia → dominio de producción que Vercel expone solo → localhost.
const vercelProd = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || (vercelProd ? `https://${vercelProd}` : "http://localhost:3000")
).replace(/\/$/, "");

export const routes = {
  home: () => "/",
  category: (slug: string) => `/categoria/${slug}`,
  subcategory: (parentSlug: string, slug: string) => `/categoria/${parentSlug}/${slug}`,
  product: (slug: string) => `/producto/${slug}`,
  search: (q?: string) => (q ? `/buscar?q=${encodeURIComponent(q)}` : "/buscar"),
} as const;

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
