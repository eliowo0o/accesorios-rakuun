/**
 * PUT del archivo a la URL de subida (S3 prefirmada o el fallback local) con progreso.
 * XMLHttpRequest porque fetch no reporta progreso de subida.
 */
export function putFile(url: string, file: File, onProgress: (percent: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress((event.loaded / event.total) * 100);
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`La subida falló (${xhr.status}).`)));
    xhr.onerror = () => reject(new Error("Sin conexión con el almacenamiento. Revisa tu internet o el CORS del bucket."));
    xhr.send(file);
  });
}
