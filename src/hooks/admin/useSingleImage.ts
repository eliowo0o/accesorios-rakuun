"use client";

import { useCallback, useState } from "react";
import type { UploadFolder } from "@/services/admin/schemas";
import { useImageUpload } from "./useImageUpload";

/** Un solo campo de imagen (imagen de categoría, hero, logo). Subir reemplaza la actual. */
export function useSingleImage(folder: UploadFolder, initialUrl: string | null) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const onUploaded = useCallback((uploaded: string) => setUrl(uploaded), []);
  const uploader = useImageUpload({ folder, onUploaded });
  const clear = useCallback(() => setUrl(null), []);
  return { url, clear, uploader };
}

export type SingleImageController = ReturnType<typeof useSingleImage>;
