const mxn = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formato visible en la tienda: "MXN $ 60,00" (coma decimal, como la app actual). */
export function formatPrice(value: number): string {
  const [int, dec] = mxn.format(value).split(".");
  return `MXN $ ${int.replace(/,/g, ".")},${dec}`;
}

/** Formato para el mensaje de WhatsApp: "$120.00". */
export function formatPricePlain(value: number): string {
  return `$${mxn.format(value)}`;
}

const dateTime = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Mexico_City",
});

/** "9 nov 2026, 15:20" en hora de CDMX. */
export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
