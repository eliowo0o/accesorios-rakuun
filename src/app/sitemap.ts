import type { MetadataRoute } from "next";
import { toAbsoluteUrl } from "@/lib/seo";
import { absoluteUrl, routes } from "@/lib/site";
import { getAllProducts, getCategoryTree } from "@/services/catalog";

/** Sitemap dinámico con categorías, subcategorías y productos visibles (los servicios ya filtran ocultos). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tree, products] = await Promise.all([getCategoryTree(), getAllProducts()]);
  const lastModified = products.reduce<string | undefined>((max, p) => (!max || p.updatedAt > max ? p.updatedAt : max), undefined);

  const home: MetadataRoute.Sitemap[number] = {
    url: absoluteUrl(routes.home()),
    lastModified,
    changeFrequency: "weekly",
    priority: 1,
  };

  const categories: MetadataRoute.Sitemap = tree.flatMap((root) => [
    { url: absoluteUrl(routes.category(root.slug)), lastModified, changeFrequency: "weekly", priority: 0.8 },
    ...root.children.map((child) => ({
      url: absoluteUrl(routes.subcategory(root.slug, child.slug)),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ]);

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: absoluteUrl(routes.product(p.slug)),
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.9,
    images: p.images.map((img) => toAbsoluteUrl(img.url)),
  }));

  return [home, ...categories, ...productEntries];
}
