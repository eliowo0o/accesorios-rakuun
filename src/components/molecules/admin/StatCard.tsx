import Link from "next/link";
import type { ReactNode } from "react";

export function StatCard({ label, value, href, icon }: { label: string; value: number; href: string; icon: ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-white p-4 transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-primary"
    >
      <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="font-display text-2xl font-bold tabular-nums text-ink">{value}</span>
        <span className="text-sm text-muted">{label}</span>
      </span>
    </Link>
  );
}
