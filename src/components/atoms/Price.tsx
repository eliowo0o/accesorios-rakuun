import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

export function Price({ value, className }: { value: number; className?: string }) {
  return <span className={cn("font-display font-bold tabular-nums", className)}>{formatPrice(value)}</span>;
}
