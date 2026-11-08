import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "RAKUUN · Accesorios hechos a mano", template: "%s · RAKUUN" },
  description: "Collares, pulseras, aretes y más accesorios hechos a mano en CDMX. Envíos a todo México.",
};

export const viewport: Viewport = {
  themeColor: "#48780c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX" className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
