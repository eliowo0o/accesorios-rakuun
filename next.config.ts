import type { NextConfig } from "next";

/** Host público del bucket S3 (p. ej. https://mi-bucket.s3.us-east-1.amazonaws.com). */
const s3Base = process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL;
const s3Pattern = s3Base ? [new URL(`${s3Base.replace(/\/$/, "")}/**`)] : [];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Solo el bucket propio: un comodín *.amazonaws.com dejaría usar el optimizador con buckets ajenos.
    remotePatterns: s3Pattern,
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
