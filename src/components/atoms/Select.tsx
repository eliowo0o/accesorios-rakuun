import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { fieldBase } from "./Input";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, className, children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(fieldBase, "h-12 cursor-pointer appearance-none pr-10", invalid ? "border-danger" : "border-line", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronsUpDown aria-hidden className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
    </div>
  );
});
