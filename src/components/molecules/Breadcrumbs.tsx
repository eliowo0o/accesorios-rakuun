import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { BreadcrumbItem } from "@/lib/seo";
import { cn } from "@/lib/cn";

/** Migas de pan. El último elemento es la página actual (sin link). */
export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Migas de pan" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} className="flex min-w-0 items-center gap-1">
              {isLast ? (
                <span aria-current="page" className="truncate font-medium text-ink">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center rounded-md hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {item.name}
                  </Link>
                  <ChevronRight aria-hidden className="size-4 shrink-0" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
