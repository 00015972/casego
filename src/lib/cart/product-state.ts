export interface CartProductState {
  inCart: boolean;
  atLimit: boolean;
  quantity: number;
}

/** Shared cart-aware state for product cards and the detail purchase panel. */
export function getCartProductState(
  quantity: number | null | undefined,
  maxQty: number,
): CartProductState {
  const safeQuantity = Math.max(0, Number(quantity) || 0);
  return {
    inCart: safeQuantity > 0,
    atLimit: safeQuantity > 0 && maxQty < 9999 && safeQuantity >= maxQty,
    quantity: safeQuantity,
  };
}
