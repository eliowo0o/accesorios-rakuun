import { getAllProducts } from "@/services/catalog";
import { Price } from "@/components/atoms";

/** Placeholder de Fase 0. Dueño: agente Tienda. */
export default async function HomePage() {
  const products = await getAllProducts();
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold text-brand-plum">RAKUUN</h1>
      <ul className="mt-6 space-y-2">
        {products.map((p) => (
          <li key={p.id} className="flex justify-between">
            <span>{p.name}</span>
            <Price value={p.price} />
          </li>
        ))}
      </ul>
    </section>
  );
}
