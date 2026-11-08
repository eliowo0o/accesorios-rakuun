"use client";

import { useCallback, useReducer } from "react";
import { requestImageUpload } from "@/services/admin/actions/uploads";
import type { ImageContentType, UploadFolder } from "@/services/admin/schemas";
import { initialUploadState, isUploading, uploadReducer, validateImageFile } from "./imageUploadReducer";
import { putFile } from "./putFile";

interface Options {
  folder: UploadFolder;
  /** Se llama por cada imagen subida con su URL pública (la que se guarda en la BD). */
  onUploaded: (url: string, fileName: string) => void;
  /** Quita de la cola las que terminan bien (el formulario ya las muestra). Por defecto true. */
  removeOnDone?: boolean;
}

export function useImageUpload({ folder, onUploaded, removeOnDone = true }: Options) {
  const [state, dispatch] = useReducer(uploadReducer, initialUploadState);

  const uploadOne = useCallback(
    async (id: string, file: File) => {
      dispatch({ type: "start", id });
      try {
        const target = await requestImageUpload({ contentType: file.type as ImageContentType, size: file.size, folder });
        if (!target.ok) throw new Error(target.error);
        await putFile(target.uploadUrl, file, (progress) => dispatch({ type: "progress", id, progress }));
        dispatch({ type: "success", id, url: target.publicUrl });
        onUploaded(target.publicUrl, file.name);
        if (removeOnDone) dispatch({ type: "remove", id });
      } catch (error) {
        dispatch({ type: "fail", id, error: error instanceof Error ? error.message : "La subida falló." });
      }
    },
    [folder, onUploaded, removeOnDone],
  );

  const addFiles = useCallback(
    async (files: FileList | File[] | null) => {
      const list = Array.from(files ?? []);
      if (!list.length) return;
      const entries = list.map((file) => ({ id: crypto.randomUUID(), file, error: validateImageFile(file) ?? undefined }));
      dispatch({ type: "add", items: entries.map(({ id, file, error }) => ({ id, name: file.name, error })) });
      // En serie: las Server Actions se despachan una a la vez de todos modos.
      for (const entry of entries) {
        if (!entry.error) await uploadOne(entry.id, entry.file);
      }
    },
    [uploadOne],
  );

  const dismiss = useCallback((id: string) => dispatch({ type: "remove", id }), []);

  return { items: state.items, isUploading: isUploading(state), addFiles, dismiss };
}

export type ImageUploadController = ReturnType<typeof useImageUpload>;
