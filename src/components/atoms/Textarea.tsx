import type React from "react";
import { type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { fieldBase } from "./Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ ref, invalid, className, rows = 3, ...props }: TextareaProps & { ref?: React.Ref<HTMLTextAreaElement> }) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(fieldBase, "py-3", invalid ? "border-danger" : "border-line", className)}
      {...props}
    />
  );
}
