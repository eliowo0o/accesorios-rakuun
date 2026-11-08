import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const tones = {
  primary: "bg-primary text-white",
  soft: "bg-primary-soft text-primary",
  neutral: "bg-gray-100 text-gray-700",
  dark: "bg-ink/80 text-white",
  danger: "bg-red-50 text-danger",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: keyof typeof tones;
}

export function Badge({ tone = "soft", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 font-display text-xs font-semibold", tones[tone], className)}
      {...props}
    />
  );
}
