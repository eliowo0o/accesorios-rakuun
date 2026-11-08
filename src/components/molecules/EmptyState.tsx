import type { ReactNode } from "react";
import { PackageOpen } from "lucide-react";

/** Mensaje cuando una lista no tiene productos. */
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-card bg-gray-50 px-6 py-12 text-center">
      <PackageOpen aria-hidden className="size-10 text-muted" />
      <p className="mt-3 font-display text-lg font-bold text-ink">{title}</p>
      {children ? <div className="mt-1 text-sm text-muted">{children}</div> : null}
    </div>
  );
}
