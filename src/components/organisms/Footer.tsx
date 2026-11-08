import { MapPin, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/atoms";
import type { StoreSettings } from "@/types";

/** lucide-react 1.x ya no trae íconos de marcas: glifo SVG propio de Instagram. */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

type FooterSettings = Pick<StoreSettings, "storeName" | "paymentMethods" | "location" | "instagramUrl" | "deliveryOptions">;

/** Pie: métodos de pago, entregas, ubicación, Instagram y recordatorio de cómo pedir. */
export function Footer({ settings }: { settings: FooterSettings }) {
  return (
    <footer className="mt-12 border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6">
        {settings.paymentMethods.length > 0 ? (
          <section aria-labelledby="footer-pagos">
            <h2 id="footer-pagos" className="font-display text-xs font-semibold uppercase tracking-wider text-muted">
              Aceptamos
            </h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {settings.paymentMethods.map((method) => (
                <li key={method}>
                  <Badge className="px-3 py-1 text-sm text-primary-hover">{method}</Badge>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {settings.deliveryOptions.length > 0 ? (
          <section aria-labelledby="footer-entregas">
            <h2 id="footer-entregas" className="font-display text-xs font-semibold uppercase tracking-wider text-muted">
              Entregas
            </h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {settings.deliveryOptions.map((option) => (
                <li key={option}>
                  <Badge tone="neutral" className="px-3 py-1 text-sm">
                    {option}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:col-span-2">
          {settings.location ? (
            <p className="inline-flex items-center gap-2 text-sm text-ink">
              <MapPin aria-hidden className="size-4 text-muted" />
              {settings.location}
            </p>
          ) : null}
          {settings.instagramUrl ? (
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-soft px-4 font-display text-sm font-semibold text-primary-hover transition-colors hover:bg-primary-soft-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <InstagramIcon className="size-5" />
              Instagram
              <span className="sr-only">(se abre en otra pestaña)</span>
            </a>
          ) : null}
        </div>

        <p className="inline-flex items-center justify-center gap-2 text-sm text-muted sm:col-span-2">
          <ShoppingCart aria-hidden className="size-4" />
          Haz tu pedido desde el carrito
        </p>
        <p className="text-center text-xs text-muted sm:col-span-2">
          © {settings.storeName} · Accesorios hechos a mano
        </p>
      </div>
    </footer>
  );
}
