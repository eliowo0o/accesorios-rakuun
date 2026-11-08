/* eslint-disable @typescript-eslint/no-explicit-any -- inspección de objetos JSON-LD sin tipar */
import { describe, expect, it } from "vitest";
import type { Product, StoreSettings } from "@/types";
import { breadcrumbJsonLd, buildMetadata, productJsonLd, serializeJsonLd, storeJsonLd, toAbsoluteUrl, truncate } from "./seo";
import { SITE_URL } from "./site";

const product: Product = {
  id: "p1",
  name: "Collar de estrella",
  slug: "collar-de-estrella",
  description: "Collar de perlas",
  price: 60,
  isVisible: true,
  isSoldOut: false,
  isFeatured: true,
  sortOrder: 1,
  images: [{ id: "i1", url: "/mock/collar.jpg", alt: "Collar", sortOrder: 1 }],
  categories: [{ id: "c1", name: "Perlas", slug: "collares-perlas", parentSlug: "collares" }],
  createdAt: "2026-11-08T00:00:00.000Z",
  updatedAt: "2026-11-08T00:00:00.000Z",
};

const settings: StoreSettings = {
  storeName: "RAKUUN",
  tagline: "Envíos a todo México",
  heroImageUrl: "/mock/hero.jpg",
  logoUrl: null,
  whatsappNumber: "5215500000000",
  instagramUrl: "https://instagram.com/rakuun",
  location: "CDMX",
  paymentMethods: ["Efectivo"],
  deliveryOptions: [],
};

describe("seo", () => {
  it("serializeJsonLd escapa < para evitar cerrar el <script>", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(out).toContain("\\u003c/script>");
  });

  it("productJsonLd arma Product + Offer en MXN con disponibilidad", () => {
    const ld = productJsonLd(product, settings) as Record<string, any>;
    expect(ld["@type"]).toBe("Product");
    expect(ld.offers.priceCurrency).toBe("MXN");
    expect(ld.offers.price).toBe("60.00");
    expect(ld.offers.availability).toBe("https://schema.org/InStock");
    expect(ld.image).toEqual([`${SITE_URL}/mock/collar.jpg`]);
    const soldOut = productJsonLd({ ...product, isSoldOut: true }, settings) as Record<string, any>;
    expect(soldOut.offers.availability).toBe("https://schema.org/OutOfStock");
  });

  it("breadcrumbJsonLd numera desde 1 con URLs absolutas", () => {
    const ld = breadcrumbJsonLd([
      { name: "Inicio", href: "/" },
      { name: "Collares", href: "/categoria/collares" },
    ]) as Record<string, any>;
    expect(ld.itemListElement[1]).toMatchObject({ position: 2, name: "Collares", item: `${SITE_URL}/categoria/collares` });
  });

  it("storeJsonLd incluye Store y WebSite con SearchAction", () => {
    const [store, site] = storeJsonLd(settings) as Record<string, any>[];
    expect(store["@type"]).toBe("Store");
    expect(store.sameAs).toEqual(["https://instagram.com/rakuun"]);
    expect(site.potentialAction["@type"]).toBe("SearchAction");
  });

  it("buildMetadata pone canonical, OG con imagen absoluta y noindex opcional", () => {
    const meta = buildMetadata({ title: "Collares", description: "x", path: "/categoria/collares", image: { url: "/a.jpg", alt: "A" } });
    expect(meta.alternates?.canonical).toBe("/categoria/collares");
    expect(meta.openGraph?.images).toEqual([{ url: `${SITE_URL}/a.jpg`, alt: "A" }]);
    expect(meta.robots).toBeUndefined();
    expect(buildMetadata({ description: "x", path: "/buscar", noindex: true }).robots).toEqual({ index: false, follow: true });
  });

  it("truncate recorta sin partir palabras y toAbsoluteUrl respeta URLs absolutas", () => {
    const long = "palabra ".repeat(40);
    const out = truncate(long, 50);
    expect(out.length).toBeLessThanOrEqual(50);
    expect(out.endsWith("…")).toBe(true);
    expect(truncate("corto")).toBe("corto");
    expect(toAbsoluteUrl("https://bucket.s3.amazonaws.com/x.jpg")).toBe("https://bucket.s3.amazonaws.com/x.jpg");
  });
});
