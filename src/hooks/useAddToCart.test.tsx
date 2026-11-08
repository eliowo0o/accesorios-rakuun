import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ADDED_FEEDBACK_MS, clampQuantity, MAX_QUANTITY, useAddToCart } from "./useAddToCart";

const add = vi.fn();
vi.mock("@/hooks/useCart", () => ({ useCart: () => ({ add }) }));

const item = { productId: "p1", slug: "collar", name: "Collar", price: 60, imageUrl: null };

describe("useAddToCart", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    add.mockClear();
  });
  afterEach(() => vi.useRealTimers());

  it("clampQuantity mantiene la cantidad entre 1 y el máximo", () => {
    expect(clampQuantity(0)).toBe(1);
    expect(clampQuantity(2.7)).toBe(2);
    expect(clampQuantity(500)).toBe(MAX_QUANTITY);
    expect(clampQuantity(Number.NaN)).toBe(1);
  });

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
