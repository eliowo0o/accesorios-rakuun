import { cn } from "@/lib/cn";

/**
 * Clases de botón para <Link> (el átomo Button es <button>). Replica primary/outline del átomo;
 * si se agrega un `buttonClass` exportado a los átomos, reemplazar esto.
 */
const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 font-display text-sm font-semibold transition-colors duration-200 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function buttonClassFor(variant: "primary" | "outline") {
  return cn(base, variant === "primary" ? "bg-primary text-white hover:bg-primary-hover" : "border border-line bg-white text-ink hover:bg-gray-50");
}
