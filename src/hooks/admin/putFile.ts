/** Falla al subir: lleva datos técnicos para el registro de errores (no se muestran al usuario). */
export class UploadError extends Error {
  constructor(
    message: string,
    readonly details: { phase: "put"; status: number; host: string; reason: "network" | "http" },
  ) {
    super(message);
    this.name = "UploadError";
  }
}

/**
 * PUT del archivo a la URL de subida (S3 prefirmada o el fallback local) con progreso.
 * XMLHttpRequest porque fetch no reporta progreso de subida.
 */
export function putFile(url: string, file: File, onProgress: (percent: number) => void): Promise<void> {
  const host = new URL(url, window.location.origin).host;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress((event.loaded / event.total) * 100);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new UploadError(`La subida falló (${xhr.status}).`, { phase: "put", status: xhr.status, host, reason: "http" }));
    // El navegador no da detalles de un error de red; con S3 casi siempre es CORS del bucket.
    xhr.onerror = () =>
      reject(
        new UploadError("Sin conexión con el almacenamiento. Revisa tu internet o el CORS del bucket.", {
          phase: "put",
          status: 0,
          host,
          reason: "network",
        }),
      );
    xhr.send(file);
  });
}
