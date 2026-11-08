"use client";

import { MessageCircle, ShoppingBag, TriangleAlert } from "lucide-react";
import { Button, Price } from "@/components/atoms";
import { Sheet } from "@/components/molecules/Sheet";
import { CartLine } from "@/components/molecules/CartLine";
import { CheckoutForm } from "@/components/organisms/CheckoutForm";
import { describeCartNotice } from "@/context/cart/cart.notices";
import type { CartNotice } from "@/context/cart/cart.types";
import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useCheckout";
import { pluralize } from "@/lib/format";
import type { StoreSettings } from "@/types";

/**
 * Bottom sheet "Tu pedido". Se monta una sola vez en src/app/(store)/layout.tsx.
 * CONTRATO: props { settings: StoreSettings }. Lógica en useCart / useCheckout.
 */
export function CartSheet({ settings }: { settings: StoreSettings }) {
  const cart = useCart();
  const checkout = useCheckout(settings);
  const isEmpty = cart.items.length === 0;

  return (
    <Sheet open={cart.isOpen} onClose={cart.close}>
      <Sheet.Header>
        <Sheet.Title>Tu pedido</Sheet.Title>
        <Sheet.Close label="Cerrar carrito" />
      </Sheet.Header>

      <Sheet.Body>
        {cart.notices.length > 0 && <CartNotices notices={cart.notices} onDismiss={cart.dismissNotices} />}

        {isEmpty ? (
          <EmptyCart onBrowse={cart.close} />
        ) : (
          <>
            <ul aria-label="Productos en tu pedido">
              {cart.items.map((item) => (
                <CartLine
                  key={item.productId}
                  item={item}
                  onDecrement={() => cart.setQuantity(item.productId, item.quantity - 1)}
                  onIncrement={() => cart.setQuantity(item.productId, item.quantity + 1)}
                  onRemove={() => cart.remove(item.productId)}
                  onNavigate={cart.close}
                />
              ))}
            </ul>

            <div className="my-4 flex items-baseline justify-between border-t border-line pt-4">
              <span className="font-display text-lg font-bold">
                Total <span className="text-sm font-medium text-gray-500">({pluralize(cart.count, "pieza", "piezas")})</span>
              </span>
              <Price value={cart.total} className="text-lg" />
            </div>

            <CheckoutForm
              values={checkout.values}
              errors={checkout.errors}
              ids={checkout.ids}
              deliveryOptions={settings.deliveryOptions}
              paymentMethods={settings.paymentMethods}
              onChange={checkout.setField}
              onSubmit={checkout.submitOrder}
            />
          </>
        )}
      </Sheet.Body>

      {!isEmpty && (
        <Sheet.Footer className="space-y-2">
          <Button type="submit" form={checkout.ids.form} variant="whatsapp" size="lg" fullWidth>
            <MessageCircle className="size-5" aria-hidden />
            Enviar pedido por WhatsApp
          </Button>
          <Button variant="outline" fullWidth onClick={checkout.requestInfo}>
            Solo pedir información
          </Button>
        </Sheet.Footer>
      )}
    </Sheet>
  );
}

function CartNotices({ notices, onDismiss }: { notices: CartNotice[]; onDismiss: () => void }) {
  return (
    <div role="status" className="mb-3 rounded-2xl bg-amber-50 p-4 text-sm text-ink">
      <div className="flex gap-2">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold">Actualizamos tu pedido</p>
          <ul className="mt-1 space-y-1">
            {notices.map((n, i) => (
              <li key={`${n.productId}-${n.kind}-${i}`}>{describeCartNotice(n)}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-2 flex justify-end">
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Entendido
        </Button>
      </div>
    </div>
  );
}

function EmptyCart({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary">
        <ShoppingBag className="size-7" aria-hidden />
      </span>
      <p className="mt-4 font-display text-lg font-bold">Tu pedido está vacío</p>
      <p className="mt-1 max-w-xs text-sm text-gray-500">Agrega tus accesorios favoritos y aquí armamos tu mensaje para WhatsApp.</p>
      <Button className="mt-6" onClick={onBrowse}>
        Ver productos
      </Button>
    </div>
  );
}
