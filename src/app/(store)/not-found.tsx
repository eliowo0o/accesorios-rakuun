import type { Metadata } from "next";
import { NotFoundContent } from "@/components/organisms/NotFoundContent";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false },
};

export default function StoreNotFound() {
  return <NotFoundContent />;
}
