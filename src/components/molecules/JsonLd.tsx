import { serializeJsonLd } from "@/lib/seo";

/** Inserta datos estructurados (schema.org) escapando "<" para evitar inyección de HTML. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
