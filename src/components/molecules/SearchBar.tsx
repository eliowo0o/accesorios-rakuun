"use client";

import Form from "next/form";
import { Search, X } from "lucide-react";
import { useId } from "react";
import { useSearchBar } from "@/hooks/useSearchBar";
import { routes } from "@/lib/site";
import { cn } from "@/lib/cn";

/**
 * Buscador: <Form> de Next navega a /buscar?q=… (funciona también sin JS).
 */
export function SearchBar({ defaultQuery = "", className }: { defaultQuery?: string; className?: string }) {
  const { value, onChange, clear, inputRef, hasValue } = useSearchBar(defaultQuery);
  const id = useId();
  return (
    <Form action={routes.search()} role="search" className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Buscar productos
      </label>
      <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
      <input
        ref={inputRef}
        id={id}
        name="q"
        type="search"
        value={value}
        onChange={onChange}
        placeholder="Buscar collares, pulseras…"
        autoComplete="off"
        enterKeyHint="search"
        className={cn(
          "h-12 w-full rounded-full border border-line bg-white pl-12 pr-12 text-base text-ink placeholder:text-gray-500",
          "transition-colors focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
          "[&::-webkit-search-cancel-button]:appearance-none",
        )}
      />
      {hasValue ? (
        <button
          type="button"
          onClick={clear}
          aria-label="Borrar búsqueda"
          className="absolute right-1 top-1/2 inline-flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-primary"
        >
          <X aria-hidden className="size-5" />
        </button>
      ) : null}
    </Form>
  );
}
