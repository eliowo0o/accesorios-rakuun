"use client";

import Image from "next/image";
import { ImagePlaceholder } from "@/components/molecules/ImagePlaceholder";
import { useProductGallery } from "@/hooks/useProductGallery";
import { cn } from "@/lib/cn";
import type { ProductImage } from "@/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

/**
 * Galería del detalle: carrusel con scroll-snap (deslizar con el dedo) + miniaturas.
 * Las imágenes se pintan en el HTML del servidor; el estado solo sincroniza la miniatura activa.
 */
export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const { trackRef, active, onScroll, goTo } = useProductGallery(images.length);

  if (images.length === 0) {
    return (
      <div className="aspect-square overflow-hidden rounded-card">
        <ImagePlaceholder label={productName} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={trackRef}
        onScroll={onScroll}
        aria-roledescription="carrusel"
        aria-label={`Fotos de ${productName}`}
        className="flex aspect-square snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-card bg-gray-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img, index) => (
          <div
            key={img.id}
            role="group"
            aria-roledescription="foto"
            aria-label={`${index + 1} de ${images.length}`}
            className="relative size-full shrink-0 snap-center"
          >
            <Image
              src={img.url}
              alt={img.alt || productName}
              fill
              preload={index === 0}
              sizes="(min-width: 1024px) 560px, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {images.length > 1 ? (
        <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Elegir foto">
          {images.map((img, index) => (
            <li key={img.id} className="shrink-0">
              <button
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Ver foto ${index + 1}: ${img.alt || productName}`}
                aria-current={index === active ? "true" : undefined}
                className={cn(
                  "relative block size-16 cursor-pointer overflow-hidden rounded-xl ring-2 ring-offset-2 transition",
                  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
                  index === active ? "ring-primary" : "ring-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
