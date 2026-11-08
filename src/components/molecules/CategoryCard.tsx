import Image from "next/image";
import Link from "next/link";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/cn";

interface CategoryCardProps {
  href: string;
  name: string;
  count: number;
  imageUrl?: string | null;
  active?: boolean;
}

/** Tarjeta de categoría con conteo de productos (panel "Categorías" y listados). */
export function CategoryCard({ href, name, count, imageUrl, active }: CategoryCardProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-[4.5rem] items-center gap-3 rounded-2xl p-3 pl-4 transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        active ? "bg-primary text-white" : "bg-primary-soft text-primary hover:bg-primary-soft-hover",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-base font-bold">{name}</span>
        <span className={cn("block text-sm font-medium", active ? "text-white/90" : "text-primary-hover")}>
          {pluralize(count, "producto", "productos")}
        </span>
      </span>
      {imageUrl ? (
        <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-white">
          <Image src={imageUrl} alt="" fill sizes="48px" className="object-cover" />
        </span>
      ) : null}
    </Link>
  );
}
