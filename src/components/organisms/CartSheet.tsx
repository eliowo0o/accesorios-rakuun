"use client";

import type { StoreSettings } from "@/types";

/**
 * STUB de Fase 0. Dueño: agente Carrito (lo reemplaza por el bottom sheet "Tu pedido" usando <Sheet>).
 * Se monta una sola vez en src/app/(store)/layout.tsx. CONTRATO: props { settings: StoreSettings }.
 */
export function CartSheet({ settings }: { settings: StoreSettings }) {
  void settings;
  return null;
}
