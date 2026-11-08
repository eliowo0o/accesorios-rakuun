import { IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/services/admin/schemas";

/** Cola de subida de imágenes: pending → uploading (progreso) → done | error. Reducer puro. */

export type UploadStatus = "pending" | "uploading" | "done" | "error";

export interface UploadItem {
  id: string;
  name: string;
  status: UploadStatus;
  /** 0–100 */
  progress: number;
  url?: string;
  error?: string;
}

export interface UploadQueueState {
  items: UploadItem[];
}

export type UploadAction =
  | { type: "add"; items: { id: string; name: string; error?: string }[] }
  | { type: "start"; id: string }
  | { type: "progress"; id: string; progress: number }
  | { type: "success"; id: string; url: string }
  | { type: "fail"; id: string; error: string }
  | { type: "remove"; id: string }
  | { type: "clearFinished" };

export const initialUploadState: UploadQueueState = { items: [] };

const patch = (state: UploadQueueState, id: string, change: Partial<UploadItem>): UploadQueueState => ({
  items: state.items.map((item) => (item.id === id ? { ...item, ...change } : item)),
});

export function uploadReducer(state: UploadQueueState, action: UploadAction): UploadQueueState {
  switch (action.type) {
    case "add":
      return {
        items: [
          ...state.items,
          ...action.items.map<UploadItem>(({ id, name, error }) =>
            error ? { id, name, status: "error", progress: 0, error } : { id, name, status: "pending", progress: 0 },
          ),
        ],
      };
    case "start":
      return patch(state, action.id, { status: "uploading", progress: 0, error: undefined });
    case "progress": {
      const item = state.items.find((i) => i.id === action.id);
      if (!item || item.status !== "uploading") return state;
      return patch(state, action.id, { progress: Math.max(item.progress, Math.min(100, Math.round(action.progress))) });
    }
    case "success":
      return patch(state, action.id, { status: "done", progress: 100, url: action.url });
    case "fail":
      return patch(state, action.id, { status: "error", error: action.error });
    case "remove":
      return { items: state.items.filter((i) => i.id !== action.id) };
    case "clearFinished":
      return { items: state.items.filter((i) => i.status === "pending" || i.status === "uploading") };
  }
}

/** Validación en cliente (el servidor vuelve a validar). Devuelve el mensaje de error o null. */
export function validateImageFile(file: { type: string; size: number }): string | null {
  if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) return "Solo JPG, PNG o WebP.";
  if (file.size === 0) return "El archivo está vacío.";
  if (file.size > MAX_IMAGE_BYTES) return "Pesa más de 5 MB.";
  return null;
}

export const isUploading = (state: UploadQueueState) =>
  state.items.some((i) => i.status === "pending" || i.status === "uploading");
