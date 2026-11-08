import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const send = vi.fn();
vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {
    send = send;
  },
  PutObjectCommand: class {
    constructor(public input: unknown) {}
  },
  DeleteObjectCommand: class {
    constructor(public input: unknown) {}
  },
}));

const { buildObjectKey, deleteObjectByUrl, keyFromPublicUrl, publicUrlForKey } = await import("./s3");

const BASE = "https://rakuun-imagenes.s3.us-east-1.amazonaws.com";
const ID = "3f2b8c1e-9a4d-4e6f-8b2a-1c3d5e7f9a0b";

describe("keyFromPublicUrl", () => {
  it("deriva la key de una URL del bucket", () => {
    expect(keyFromPublicUrl(`${BASE}/products/${ID}.webp`, BASE)).toBe(`products/${ID}.webp`);
    expect(keyFromPublicUrl(`${BASE}/categories/${ID}.jpg?v=2`, `${BASE}/`)).toBe(`categories/${ID}.jpg`);
  });

  it("ignora URLs que no son del bucket", () => {
    expect(keyFromPublicUrl("/mock/collar-de-estrella.jpg", BASE)).toBeNull();
    expect(keyFromPublicUrl(`/uploads-dev/${ID}.jpg`, BASE)).toBeNull();
    expect(keyFromPublicUrl(`https://otro-bucket.s3.amazonaws.com/products/${ID}.jpg`, BASE)).toBeNull();
    expect(keyFromPublicUrl(`${BASE}.evil.com/products/${ID}.jpg`, BASE)).toBeNull();
  });

  it("ignora keys que no generamos nosotros (sin traversal ni carpetas ajenas)", () => {
    expect(keyFromPublicUrl(`${BASE}/otra/${ID}.jpg`, BASE)).toBeNull();
    expect(keyFromPublicUrl(`${BASE}/products/../secret.jpg`, BASE)).toBeNull();
    expect(keyFromPublicUrl(`${BASE}/products/foto.jpg`, BASE)).toBeNull();
    expect(keyFromPublicUrl(`${BASE}/%E0%A4%A`, BASE)).toBeNull();
  });

  it("buildObjectKey y publicUrlForKey son inversos", () => {
    const key = buildObjectKey("settings", "image/png", ID);
    expect(key).toBe(`settings/${ID}.png`);
    expect(keyFromPublicUrl(publicUrlForKey(BASE, key), BASE)).toBe(key);
  });
});

describe("deleteObjectByUrl", () => {
  beforeEach(() => {
    send.mockReset();
    vi.stubEnv("AWS_REGION", "us-east-1");
    vi.stubEnv("S3_BUCKET", "rakuun-imagenes");
    vi.stubEnv("AWS_ACCESS_KEY_ID", "test");
    vi.stubEnv("AWS_SECRET_ACCESS_KEY", "test");
    vi.stubEnv("NEXT_PUBLIC_S3_PUBLIC_BASE_URL", BASE);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("borra con la key derivada", async () => {
    expect(await deleteObjectByUrl(`${BASE}/products/${ID}.webp`)).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0].input).toEqual({ Bucket: "rakuun-imagenes", Key: `products/${ID}.webp` });
  });

  it("no llama a S3 para URLs ajenas", async () => {
    expect(await deleteObjectByUrl("/mock/logo.jpg")).toBe(false);
    expect(send).not.toHaveBeenCalled();
  });

  it("sin configuración de S3 no hace nada", async () => {
    vi.stubEnv("S3_BUCKET", "");
    expect(await deleteObjectByUrl(`${BASE}/products/${ID}.webp`)).toBe(false);
    expect(send).not.toHaveBeenCalled();
  });
});
