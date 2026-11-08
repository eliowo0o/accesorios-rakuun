import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const base =
  "inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-4 font-display text-sm font-semibold transition-colors duration-200 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function chipClass(active?: boolean) {
  return cn(base, active ? "bg-primary text-white shadow-sm" : "bg-primary-soft text-primary hover:bg-primary-soft-hover");
}

/** Chip como link (navegación de categorías). */
export function ChipLink({ active, className, ...props }: ComponentProps<typeof Link> & { active?: boolean }) {
  return <Link aria-current={active ? "page" : undefined} className={cn(chipClass(active), className)} {...props} />;
}

/** Chip como botón (filtros, selección). */
export function ChipButton({ active, className, type = "button", ...props }: ComponentProps<"button"> & { active?: boolean }) {
  return <button type={type} aria-pressed={active} className={cn(chipClass(active), className)} {...props} />;
}
