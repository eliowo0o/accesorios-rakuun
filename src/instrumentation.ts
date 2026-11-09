import type { Instrumentation } from "next";

/**
 * Next llama esto con CADA error del servidor (render, Route Handlers, Server Actions, proxy).
 * Se guarda en `error_logs` para verlo en /admin/errores.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { describeError, logError } = await import("@/lib/error-log/logger");
  const { message, stack, digest } = describeError(err);
  const ua = request.headers["user-agent"];
  await logError({
    source: context.routeType === "action" ? "action" : "server",
    message,
    stack,
    digest,
    path: request.path,
    route: context.routePath,
    userAgent: Array.isArray(ua) ? ua[0] : (ua ?? null),
    context: {
      method: request.method,
      routeType: context.routeType,
      renderSource: "renderSource" in context ? context.renderSource : undefined,
      revalidateReason: "revalidateReason" in context ? context.revalidateReason : undefined,
    },
  });
};
