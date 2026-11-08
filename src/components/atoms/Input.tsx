import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const fieldBase =
  "w-full rounded-2xl border bg-white px-4 text-base text-ink placeholder:text-gray-400 transition-colors " +
  "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50";

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(fieldBase, "h-12", invalid ? "border-danger" : "border-line", className)}
      {...props}
    />
  );
});
