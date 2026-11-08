import Image from "next/image";
import { ArrowDown } from "lucide-react";
import type { StoreSettings } from "@/types";

interface HeroProps {
  settings: Pick<StoreSettings, "storeName" | "tagline" | "heroImageUrl" | "logoUrl">;
  /** id de la sección a la que baja el botón "Ver productos". */
  targetId: string;
}

/** Portada de la home: collage de la marca, logo, nombre, tagline y "Ver productos". */
export function Hero({ settings, targetId }: HeroProps) {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-brand-plum">
      {settings.heroImageUrl ? (
        <Image
          src={settings.heroImageUrl}
          alt=""
          fill
          preload
          sizes="100vw"
          className="-z-10 object-cover"
        />
      ) : (
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-olive via-brand-sage to-brand-mauve" />
      )}
      {/* Velo para asegurar contraste del texto sobre la foto. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/40" />

      <div className="mx-auto flex min-h-[22rem] max-w-6xl flex-col items-center justify-center px-4 py-12 text-center text-white sm:min-h-[26rem]">
        {settings.logoUrl ? (
          <Image
            src={settings.logoUrl}
            alt={`Logo de ${settings.storeName}`}
            width={112}
            height={112}
            className="size-24 rounded-3xl object-cover shadow-lg ring-4 ring-white/30 sm:size-28"
          />
        ) : null}
        <h1 id="hero-title" className="mt-4 font-display text-4xl font-extrabold tracking-tight drop-shadow sm:text-5xl">
          {settings.storeName}
        </h1>
        <p className="mt-1 text-lg font-medium text-white/95 drop-shadow">{settings.tagline}</p>
        <a
          href={`#${targetId}`}
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-display text-base font-bold text-ink shadow-md transition-colors duration-200 hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Ver productos
          <ArrowDown aria-hidden className="size-5" />
        </a>
      </div>
    </section>
  );
}
