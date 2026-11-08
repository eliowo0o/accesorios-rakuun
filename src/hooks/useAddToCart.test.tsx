import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ADDED_FEEDBACK_MS, useAddToCart } from "./useAddToCart";

const add = vi.fn();
vi.mock("@/hooks/useCart", () => ({ useCartActions: () => ({ add }) }));

const item = { productId: "p1", slug: "collar", name: "Collar", price: 60, imageUrl: null };

describe("useAddToCart", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    add.mockClear();
  });
  afterEach(() => vi.useRealTimers());

  it("agrega con la cantidad elegida, reinicia la cantidad y muestra 'Agregado' un momento", () => {
    const { result } = renderHook(() => useAddToCart(item));
    act(() => result.current.increment());
    act(() => result.current.increment());
    expect(result.current.quantity).toBe(3);

    act(() => result.current.add());
    expect(add).toHaveBeenCalledWith(item, 3);
    expect(result.current.added).toBe(true);
    expect(result.current.quantity).toBe(1);

    act(() => vi.advanceTimersByTime(ADDED_FEEDBACK_MS));
    expect(result.current.added).toBe(false);
  });

  it("no baja de 1", () => {
    const { result } = renderHook(() => useAddToCart(item));
    act(() => result.current.decrement());
    expect(result.current.quantity).toBe(1);
    expect(result.current.canDecrement).toBe(false);
  });
});
