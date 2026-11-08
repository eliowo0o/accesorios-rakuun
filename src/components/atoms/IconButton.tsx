import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Obligatorio: los botones de solo ícono necesitan nombre accesible. */
  label: string;
  variant?: "soft" | "ghost" | "light";
}

const variants = {
  soft: "bg-gray-100 text-ink hover:bg-gray-200",
  ghost: "bg-transparent text-ink hover:bg-gray-100",
  light: "bg-white/90 text-ink shadow-sm hover:bg-white",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = "ghost", className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
});
