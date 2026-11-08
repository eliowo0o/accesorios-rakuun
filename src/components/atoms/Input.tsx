import type React from "react";
import { type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const fieldBase =
  "w-full rounded-2xl border bg-white px-4 text-base text-ink placeholder:text-gray-500 transition-colors " +
  "focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:bg-gray-50";

export function Input({ ref, invalid, className, ...props }: InputProps & { ref?: React.Ref<HTMLInputElement> }) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(fieldBase, "h-12", invalid ? "border-danger" : "border-line", className)}
      {...props}
    />
  );
}
