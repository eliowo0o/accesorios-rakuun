import Image from "next/image";
import Link from "next/link";
import { CartButton } from "@/components/molecules/CartButton";
import { routes } from "@/lib/site";
import type { StoreSettings } from "@/types";

/** Header fijo: logo + nombre (link a inicio) y botón de carrito con contador. */
export function Header({ settings }: { settings: Pick<StoreSettings, "storeName" | "logoUrl"> }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href={routes.home()}
          className="flex min-h-11 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {settings.logoUrl ? (
            <Image
              src={settings.logoUrl}
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-xl object-cover ring-1 ring-black/5"
            />
          ) : null}
          <span className="font-display text-lg font-extrabold tracking-tight text-brand-plum">{settings.storeName}</span>
          <span className="sr-only">, ir al inicio</span>
        </Link>
        <CartButton />
      </div>
    </header>
  );
}
