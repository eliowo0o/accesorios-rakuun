"use client";

import { useState } from "react";
import { slugify } from "@/lib/slug";

/**
 * Nombre + slug: mientras el admin no toque el slug, se genera del nombre.
 * Al editar algo existente el slug no cambia solo (para no romper URLs ya indexadas).
 */
export function useSlugField(initialName = "", initialSlug = "") {
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  const [touched, setTouched] = useState(initialSlug !== "");

  const onNameChange = (value: string) => {
    setName(value);
    if (!touched) setSlug(slugify(value));
  };

  const onSlugChange = (value: string) => {
    setSlug(value);
    setTouched(value !== "");
  };

  /** Limpia el slug en la salida del campo ("Collar Lindo" → "collar-lindo"). */
  const onSlugBlur = () => {
    const clean = slugify(slug);
    setSlug(clean || slugify(name));
    setTouched(clean !== "");
  };

  return { name, slug, onNameChange, onSlugChange, onSlugBlur };
}
