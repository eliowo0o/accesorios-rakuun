import { ImageOff } from "lucide-react";
import { cn } from "@/lib/cn";

/** Fondo neutro con el nombre cuando un producto o categoría no tiene imagen. */
export function ImagePlaceholder({ label, className }: { label: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={`${label} (sin foto)`}
      className={cn("flex size-full flex-col items-center justify-center gap-2 bg-brand-cream p-6 text-center text-brand-plum", className)}
    >
      <ImageOff aria-hidden className="size-7 opacity-60" />
      <span className="line-clamp-2 font-display text-lg font-bold">{label}</span>
    </div>
  );
}
