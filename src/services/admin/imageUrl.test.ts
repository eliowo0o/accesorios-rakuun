import { afterEach, describe, expect, it, vi } from "vitest";
import { isAllowedImageUrl } from "./schemas";

const S3 = "https://rakuun.s3.us-east-1.amazonaws.com";

afterEach(() => vi.unstubAllEnvs());

describe("isAllowedImageUrl", () => {
  it("producción: solo el bucket propio", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_S3_PUBLIC_BASE_URL", S3);
    expect(isAllowedImageUrl(`${S3}/products/a.webp`)).toBe(true);
    expect(isAllowedImageUrl("https://otro.com/x.png")).toBe(false);
    expect(isAllowedImageUrl("/mock/logo.jpg")).toBe(false);
    expect(isAllowedImageUrl(`${S3}.evil.com/x.png`)).toBe(false);
  });
  it("desarrollo: rutas locales, nunca javascript:/data:/protocol-relative", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_S3_PUBLIC_BASE_URL", "");
    expect(isAllowedImageUrl("/mock/logo.jpg")).toBe(true);
    expect(isAllowedImageUrl("//evil.com/x.png")).toBe(false);
    expect(isAllowedImageUrl("javascript:alert(1)")).toBe(false);
    expect(isAllowedImageUrl("data:image/png;base64,AAA")).toBe(false);
  });
});
